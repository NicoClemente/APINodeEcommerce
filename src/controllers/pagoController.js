import { MercadoPagoConfig, Preference } from 'mercadopago'; // Cambiamos Payment por Preference

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
      const { items, total, payer, direccionEntrega } = req.body;

      if (!items?.length) {
        return res.status(400).json({ error: 'Lista de items vacía' });
      }

      const preference = new Preference(this.client);
      
      const preferenceData = {
        items: items.map(item => ({
          id: item._id,
          title: item.titulo,
          quantity: item.cantidad,
          unit_price: item.precio,
          currency_id: "ARS"
        })),
        payer: {
          email: payer.email,
          address: {
            zip_code: direccionEntrega.codigoPostal,
            street_name: direccionEntrega.calle,
            street_number: "123"
          }
        },
        back_urls: {
          success: "https://ecommerce-electronica-cs.vercel.app/pago-exitoso",
          failure: "https://ecommerce-electronica-cs.vercel.app/pago-fallido",
          pending: "https://ecommerce-electronica-cs.vercel.app/pago-pendiente"
        },
        auto_return: "approved",
        notification_url: process.env.WEBHOOK_URL,
        statement_descriptor: "ElectronicaCS",
        external_reference: new Date().getTime().toString()
      };

      const response = await preference.create({ body: preferenceData });

      return res.json({
        status: 'success',
        preference_id: response.id,
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
}

export default new PagoController();