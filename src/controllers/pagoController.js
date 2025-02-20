import { MercadoPagoConfig, Preference } from 'mercadopago';

class PagoController {
  constructor() {
    this.client = null;
    this.initializeMercadoPago();
  }

  initializeMercadoPago() {
    try {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Mercado Pago Access Token no configurado');
      }
      this.client = new MercadoPagoConfig({ accessToken });
    } catch (error) {
      console.error('Error inicializando MercadoPago:', error);
      throw error;
    }
  }

  procesarPago = async (req, res) => {
    try {
      const { items, total, direccionEntrega } = req.body;
      
      if (!items?.length) {
        return res.status(400).json({ error: 'No hay items en el carrito' });
      }

      const preference = new Preference(this.client);
      
      const preferenceData = {
        items: items.map(item => ({
          id: item._id,
          title: item.titulo,
          quantity: Number(item.cantidad),
          currency_id: "ARS",
          unit_price: Number(item.precio),
          description: `${item.titulo} - ElectronicaCS`
        })),
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago-exitoso`,
          failure: `${process.env.FRONTEND_URL}/pago-fallido`,
          pending: `${process.env.FRONTEND_URL}/pago-pendiente`
        },
        external_reference: `ORDER-${Date.now()}`,
        notification_url: process.env.WEBHOOK_URL,
        statement_descriptor: "ElectronicaCS",
        binary_mode: true,
        expires: true,
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await preference.create({ body: preferenceData });
      
      return res.json({
        preferenceId: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point
      });

    } catch (error) {
      console.error('Error procesando pago:', error);
      return res.status(500).json({ 
        error: 'Error al procesar el pago',
        details: error.message
      });
    }
  }

  handleWebhook = async (req, res) => {
    try {
      const { type, data } = req.query;
      
      console.log('Webhook recibido:', { type, data });

      if (type === 'payment') {
        const { id } = data;
        console.log('ID de pago:', id);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Error en webhook:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  }
}

export default new PagoController();