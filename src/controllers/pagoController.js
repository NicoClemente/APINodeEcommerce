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
      console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
  
      const { items, total, direccionEntrega } = req.body;
      
      if (!items?.length) {
        return res.status(400).json({ error: 'No hay items en el carrito' });
      }
  
      const preference = new Preference(this.client);
      
      const preferenceData = {
        items: items.map(item => ({
          title: item.title,
          unit_price: Number(item.unit_price),
          quantity: Number(item.quantity),
          currency_id: "ARS"
        })),
        payment_methods: {
          default_payment_method_id: "visa",
          installments: 1
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago-exitoso`,
          failure: `${process.env.FRONTEND_URL}/pago-fallido`,
          pending: `${process.env.FRONTEND_URL}/pago-pendiente`
        },
        auto_return: "approved",
        binary_mode: true
      };
  
      console.log('Preference Data:', JSON.stringify(preferenceData, null, 2));
  
      const response = await preference.create({ body: preferenceData });
      
      console.log('MercadoPago Response:', JSON.stringify(response, null, 2));
  
      return res.json({
        init_point: response.sandbox_init_point || response.init_point
      });
  
    } catch (error) {
      console.error('Error detallado:', error);
      return res.status(500).json({ 
        error: 'Error al procesar el pago',
        details: error.message || error
      });
    }
  }

  handleWebhook = async (req, res) => {
    try {
      const { type, data } = req.query;
      console.log('Webhook recibido:', { type, data });
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error en webhook:', error);
      res.status(500).json({ error: 'Error procesando webhook' });
    }
  }
}


export default new PagoController();