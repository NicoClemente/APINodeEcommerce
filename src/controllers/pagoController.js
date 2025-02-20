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
      const { items, direccionEntrega } = req.body;
      
      if (!items?.length) {
        return res.status(400).json({ error: 'No hay items en el carrito' });
      }
  
      const preference = new Preference(this.client);
      
      const preferenceData = {
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          currency_id: "ARS"
        })),
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago-exitoso`,
          failure: `${process.env.FRONTEND_URL}/pago-fallido`,
          pending: `${process.env.FRONTEND_URL}/pago-pendiente`
        },
        auto_return: "approved",
        binary_mode: true
      };
  
      const response = await preference.create({ body: preferenceData });
      
      return res.json({
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