import mercadopago from 'mercadopago';

class PagoController {
  constructor() {
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
    });
  }

  async procesarPago(req, res) {
    try {
      const { items, total } = req.body;

      const payment_data = {
        transaction_amount: Number(total),
        description: 'Compra en ElectronicaCS',
        payment_method_id: 'visa', 
        payer: {
          email: req.body.payer.email
        },
        additional_info: {
          items: items.map(item => ({
            id: item._id,
            title: item.titulo,
            quantity: item.cantidad,
            unit_price: Number(item.precio)
          }))
        }
      };

      const payment = await mercadopago.payment.create(payment_data);
      res.json(payment.response);
    } catch (error) {
      console.error('Error al procesar pago:', error);
      res.status(500).json({ 
        error: 'Error al procesar el pago',
        details: error.message 
      });
    }
  }

  async verificarEstado(req, res) {
    try {
      const { transactionId } = req.params;
      const payment = await mercadopago.payment.get(transactionId);
      res.json(payment.response);
    } catch (error) {
      console.error('Error al verificar estado:', error);
      res.status(500).json({ error: 'Error al verificar estado del pago' });
    }
  }
}

export default new PagoController();