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
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago-exitoso`,
          failure: `${process.env.FRONTEND_URL}/pago-fallido`,
          pending: `${process.env.FRONTEND_URL}/pago-pendiente`
        },
        auto_return: "approved"
      };
  
      console.log('Preference Data:', JSON.stringify(preferenceData, null, 2));
  
      const response = await preference.create({ body: preferenceData });
      
      return res.json({
        init_point: response.init_point
      });
  
    } catch (error) {
      console.error('Error procesando pago:', error.response?.data || error);
      return res.status(500).json({ 
        error: 'Error al procesar el pago',
        details: error.response?.data || error.message
      });
    }
  }
}

export default new PagoController();