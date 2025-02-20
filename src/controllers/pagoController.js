// src/controllers/pagoController.js 
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
      const { items, total, payer, direccionEntrega } = req.body;

      // Validaciones
      if (!items?.length) {
        return res.status(400).json({ error: 'No hay items en el carrito' });
      }

      const preference = new Preference(this.client);
      
      const preferenceData = {
        items: items.map(item => ({
          id: item._id,
          title: item.titulo,
          quantity: Number(item.cantidad),
          unit_price: Number(item.precio),
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
          success: `${process.env.FRONTEND_URL}/pago-exitoso`,
          failure: `${process.env.FRONTEND_URL}/pago-fallido`,
          pending: `${process.env.FRONTEND_URL}/pago-pendiente`
        },
        auto_return: "approved",
        notification_url: process.env.WEBHOOK_URL,
        statement_descriptor: "ElectronicaCS",
        external_reference: `ORDER-${Date.now()}`
      };

      const response = await preference.create({ body: preferenceData });

      return res.json({
        id: response.id,
        init_point: response.init_point
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
      const { query } = req;
      const { type, data } = query;

      console.log('Webhook recibido:', { type, data });

      if (type === 'payment') {
        const paymentId = data.id;
        // Aquí puedes actualizar el estado del pedido en tu base de datos
        console.log(`Pago ${paymentId} actualizado`);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Error en webhook:', error);
      res.status(500).send('Error procesando webhook');
    }
  }
}

export default new PagoController();