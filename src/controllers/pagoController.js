import { MercadoPagoConfig, Payment } from 'mercadopago';

class PagoController {
  constructor() {
    // Updated configuration method
    try {
      this.client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
      });
    } catch (configError) {
      console.error('Error configurando MercadoPago:', configError);
      throw configError;
    }
  }

  async procesarPago(req, res) {
    try {
      const { items, total } = req.body;

      // Validate required fields
      if (!items || !total || !req.body.payer?.email) {
        return res.status(400).json({ 
          error: 'Datos de pago incompletos',
          details: {
            items: !!items,
            total: !!total,
            email: !!req.body.payer?.email
          }
        });
      }

      const payment = new Payment(this.client);

      const payment_data = {
        transaction_amount: Number(total),
        description: 'Compra en ElectronicaCS',
        payment_method_id: 'visa', 
        payer: {
          email: req.body.payer.email
        },
        additional_info: {
          items: items.map(item => ({
            id: item._id || 'N/A',
            title: item.titulo || 'Producto sin título',
            quantity: item.cantidad || 1,
            unit_price: Number(item.precio) || 0
          }))
        }
      };

      console.log('Datos de pago:', JSON.stringify(payment_data, null, 2));

      try {
        const paymentResponse = await payment.create({ body: payment_data });
        console.log('Respuesta de pago:', JSON.stringify(paymentResponse, null, 2));
        res.json(paymentResponse);
      } catch (paymentError) {
        console.error('Error al crear pago con Mercado Pago:', paymentError);
        
        // Log detailed error information
        if (paymentError.response) {
          console.error('Detalles de respuesta:', JSON.stringify(paymentError.response.data, null, 2));
        }

        res.status(500).json({ 
          error: 'Error al procesar el pago',
          details: {
            message: paymentError.message,
            code: paymentError.code,
            response: paymentError.response?.data || 'Sin detalles adicionales'
          }
        });
      }
    } catch (error) {
      console.error('Error inesperado al procesar pago:', error);
      res.status(500).json({ 
        error: 'Error interno al procesar el pago',
        details: error.message 
      });
    }
  }

  async verificarEstado(req, res) {
    try {
      const { transactionId } = req.params;
      
      if (!transactionId) {
        return res.status(400).json({ error: 'ID de transacción requerido' });
      }

      const payment = new Payment(this.client);

      try {
        const paymentResponse = await payment.get({ id: transactionId });
        res.json(paymentResponse);
      } catch (retrieveError) {
        console.error('Error al recuperar estado de pago:', retrieveError);
        
        res.status(500).json({ 
          error: 'Error al verificar estado del pago',
          details: {
            message: retrieveError.message,
            code: retrieveError.code
          }
        });
      }
    } catch (error) {
      console.error('Error inesperado al verificar estado:', error);
      res.status(500).json({ error: 'Error interno al verificar estado del pago' });
    }
  }
}

export default new PagoController();