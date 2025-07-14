import { MercadoPagoConfig, Preference } from 'mercadopago';

class PagoController {
  constructor() {
    this.client = null;
    this.initializeMercadoPago();
  }

  initializeMercadoPago() {
    try {
      // Para desarrollo, usa el access token de TEST
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_TEST_ACCESS_TOKEN;
      
      if (!accessToken) {
        throw new Error('Mercado Pago Access Token no configurado');
      }
      
      console.log('🔑 Inicializando MercadoPago para:', process.env.NODE_ENV || 'development');
      console.log('🔑 Token type:', accessToken.startsWith('TEST-') ? 'SANDBOX' : 'PRODUCTION');
      
      this.client = new MercadoPagoConfig({ 
        accessToken,
        options: {
          timeout: 5000,
          idempotencyKey: 'abc'
        }
      });
      
      console.log('✅ MercadoPago cliente inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando MercadoPago:', error);
      throw error;
    }
  }

  procesarPago = async (req, res) => {
    try {
      console.log('🚀 Procesando pago - Ambiente:', process.env.NODE_ENV || 'development');
      console.log('📦 Body completo:', JSON.stringify(req.body, null, 2));
      console.log('🔗 Headers:', req.headers);
  
      const { items } = req.body;
      
      // Validaciones básicas
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error('❌ Items inválidos:', items);
        return res.status(400).json({ 
          error: 'No hay items en el carrito',
          received: { items, type: typeof items, isArray: Array.isArray(items) }
        });
      }

      // Validar estructura de cada item
      const invalidItems = [];
      items.forEach((item, index) => {
        if (!item.title || !item.unit_price || !item.quantity) {
          invalidItems.push({ index, item });
        }
      });

      if (invalidItems.length > 0) {
        console.error('❌ Items con estructura inválida:', invalidItems);
        return res.status(400).json({ 
          error: 'Items con estructura inválida',
          invalidItems 
        });
      }
  
      console.log('✅ Items validados correctamente');
      
      const preference = new Preference(this.client);
      
      // URLs para desarrollo
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      const preferenceData = {
        items: items.map(item => ({
          title: String(item.title).substring(0, 256),
          unit_price: Number(item.unit_price),
          quantity: Number(item.quantity),
          currency_id: "ARS"
        })),
        back_urls: {
          success: `${frontendURL}/pago/exitoso`,
          failure: `${frontendURL}/pago/fallido`, 
          pending: `${frontendURL}/pago/pendiente`
        },
        auto_return: "approved",
        binary_mode: true,
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12,
        },
        statement_descriptor: "ElectronicaCS Test",
        external_reference: `TEST_ORDER_${Date.now()}`,
        expires: false,
        expiration_date_from: null,
        expiration_date_to: null
      };
  
      console.log('📋 Creando preferencia con datos:', JSON.stringify(preferenceData, null, 2));
  
      const response = await preference.create({ body: preferenceData });
      
      console.log('✅ Respuesta de MercadoPago:');
      console.log('- ID:', response.id);
      console.log('- Init Point:', response.init_point);
      console.log('- Sandbox Init Point:', response.sandbox_init_point);
      
      // Para desarrollo, SIEMPRE usar sandbox_init_point
      const paymentUrl = response.sandbox_init_point || response.init_point;
      
      if (!paymentUrl) {
        console.error('❌ No se recibió URL de pago');
        return res.status(500).json({ 
          error: 'No se pudo generar la URL de pago',
          response: response 
        });
      }

      const responseData = {
        init_point: paymentUrl,
        id: response.id,
        sandbox_init_point: response.sandbox_init_point,
        preference_id: response.id,
        external_reference: preferenceData.external_reference,
        environment: process.env.NODE_ENV || 'development'
      };
      
      console.log('📤 Enviando respuesta:', responseData);
      
      return res.status(200).json(responseData);
  
    } catch (error) {
      console.error('❌ Error completo en procesarPago:');
      console.error('- Message:', error.message);
      console.error('- Stack:', error.stack);
      console.error('- Response:', error.response?.data);
      console.error('- Status:', error.response?.status);
      console.error('- Headers:', error.response?.headers);
      
      return res.status(500).json({ 
        error: 'Error al procesar el pago',
        details: error.message,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    }
  }

  handleWebhook = async (req, res) => {
    try {
      const { type, data } = req.query;
      console.log('🔔 Webhook recibido:', { type, data, body: req.body });
      res.status(200).send('OK');
    } catch (error) {
      console.error('❌ Error en webhook:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  }
}

export default new PagoController();