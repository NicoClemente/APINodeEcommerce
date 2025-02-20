import { MercadoPagoConfig, Payment } from 'mercadopago';

class PagoController {
  constructor() {
    this.client = null;
    this.initializeMercadoPago();
  }

  initializeMercadoPago() {
    try {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      
      if (!accessToken) {
        console.error('Mercado Pago Access Token no configurado');
        return;
      }

      this.client = new MercadoPagoConfig({ accessToken });
      console.log('Mercado Pago client inicializado correctamente');
    } catch (configError) {
      console.error('Error configurando MercadoPago:', configError);
    }
  }

  procesarPago = async (req, res) => {
    console.log('Solicitud de pago recibida:', JSON.stringify(req.body, null, 2));

    if (!this.client) {
      this.initializeMercadoPago();
    }

    if (!this.client) {
      return res.status(500).json({ 
        error: 'Error de configuración de Mercado Pago',
        details: 'No se pudo inicializar el cliente'
      });
    }

    try {
      const { items, total, payer, direccionEntrega } = req.body;

      if (!items?.length) {
        return res.status(400).json({ error: 'Lista de items inválida' });
      }

      if (!total || isNaN(Number(total))) {
        return res.status(400).json({ error: 'Total inválido' });
      }

      const payment = new Payment(this.client);
      
      const payment_data = {
        transaction_amount: Number(total),
        description: 'Compra en ElectronicaCS',
        payment_method_id: 'visa',
        payer: {
          email: payer.email,
          identification: {
            type: 'DNI',
            number: '12345678'
          },
          address: {
            zip_code: direccionEntrega.codigoPostal,
            street_name: direccionEntrega.calle,
            street_number: "123"
          }
        }
      };

      console.log('Datos de pago:', JSON.stringify(payment_data, null, 2));

      const response = await payment.create({ body: payment_data });
      console.log('Respuesta de MP:', response);

      res.json({
        status: 'success',
        payment_id: response.id,
        status: response.status,
        detail: response.status_detail
      });

    } catch (error) {
      console.error('Error en procesarPago:', error);
      res.status(500).json({ 
        error: 'Error al procesar el pago',
        details: error.message 
      });
    }
  }

  verificarEstado = async (req, res) => {
    try {
      const { transactionId } = req.params;
      
      if (!this.client) {
        this.initializeMercadoPago();
      }

      if (!this.client) {
        return res.status(500).json({ error: 'Error de configuración' });
      }

      const payment = new Payment(this.client);
      const response = await payment.get({ id: transactionId });
      
      res.json(response);
    } catch (error) {
      console.error('Error al verificar pago:', error);
      res.status(500).json({ error: 'Error al verificar el pago' });
    }
  }
}

export default new PagoController();