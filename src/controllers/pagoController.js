import { MercadoPagoConfig, Payment } from 'mercadopago';

class PagoController {
  constructor() {
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
    console.log('Solicitud de pago recibida:', req.body);

    try {
      const { items, total, payer } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
          error: 'Lista de items inválida',
          details: 'Se requiere un arreglo de items no vacío'
        });
      }

      if (!total || isNaN(Number(total)) || Number(total) <= 0) {
        return res.status(400).json({ 
          error: 'Total inválido',
          details: 'El total debe ser un número positivo'
        });
      }

      if (!payer || !payer.email) {
        return res.status(400).json({ 
          error: 'Información del pagador incompleta',
          details: 'Se requiere un email de pagador válido'
        });
      }

      const payment = new Payment(this.client);

      const payment_data = {
        transaction_amount: Number(total),
        description: 'Compra en ElectronicaCS',
        payment_method_id: 'visa', 
        payer: {
          email: payer.email
        },
        additional_info: {
          items: items.map(item => ({
            id: item._id || 'N/A',
            title: item.titulo || 'Producto sin título',
            quantity: Number(item.cantidad) || 1,
            unit_price: Number(item.precio) || 0
          }))
        }
      };

      console.log('Datos de pago procesados:', JSON.stringify(payment_data, null, 2));

      try {
        const paymentResponse = await payment.create({ body: payment_data });
        console.log('Respuesta de pago:', JSON.stringify(paymentResponse, null, 2));
        
        res.json({
          message: 'Pago procesado exitosamente',
          paymentDetails: paymentResponse
        });
      } catch (paymentCreationError) {
        console.error('Error al crear pago:', paymentCreationError);
        
        res.status(500).json({ 
          error: 'Error al procesar el pago',
          details: {
            message: paymentCreationError.message,
            raw: paymentCreationError.response?.data || 'Sin detalles adicionales'
          }
        });
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  }
}

export default new PagoController();