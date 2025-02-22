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
      const { items } = req.body;
      
      const preference = new Preference(this.client);
      
      const preferenceData = {
        items: items.map(item => ({
          title: item.titulo,
          quantity: Number(item.cantidad),
          unit_price: Number(item.precio),
          currency_id: "ARS"
        })),
        payment_methods: {
          default_payment_method_id: "visa",
          installments: 1,
          default_installments: 1
        },
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
        init_point: response.sandbox_init_point || response.init_point
      });
  
    } catch (error) {
      console.error('Error procesando pago:', error);
      return res.status(500).json({ 
        error: 'Error al procesar el pago',
        details: error.message
      });
    }
  }
}

export default new PagoController();