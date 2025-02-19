import { MercadoPagoConfig, Payment } from 'mercadopago';

class PagoController {
  constructor() {
    this.initializeMercadoPago();
  }

  initializeMercadoPago() {
    try {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      
      if (!accessToken) {
        console.error('Mercado Pago Access Token no configurado');
        throw new Error('Access Token de Mercado Pago no encontrado');
      }

      this.client = new MercadoPagoConfig({
        accessToken: accessToken
      });
    } catch (configError) {
      console.error('Error configurando MercadoPago:', configError);
      this.client = null;
    }
  }

  async procesarPago(req, res) {
    // Verificar inicialización del cliente
    if (!this.client) {
      this.initializeMercadoPago();
      
      if (!this.client) {
        return res.status(500).json({ 
          error: 'Error de configuración de Mercado Pago',
          details: 'No se pudo inicializar el cliente de Mercado Pago'
        });
      }
    }

    console.log('Solicitud de pago recibida:', JSON.stringify(req.body, null, 2));

    try {
      const { items, total, payer, direccionEntrega } = req.body;

      // Validaciones exhaustivas
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

      // Validar dirección de entrega
      if (!direccionEntrega || 
          !direccionEntrega.calle || 
          !direccionEntrega.ciudad || 
          !direccionEntrega.codigoPostal) {
        return res.status(400).json({ 
          error: 'Dirección de entrega incompleta',
          details: 'Se requieren todos los campos de la dirección'
        });
      }

      // Crear instancia de Payment cada vez
      const payment = new Payment(this.client);

      const payment_data = {
        transaction_amount: Number(total),
        description: 'Compra en ElectronicaCS',
        payment_method_id: 'visa', 
        payer: {
          email: payer.email,
          address: {
            street_name: direccionEntrega.calle,
            city: direccionEntrega.ciudad,
            zip_code: direccionEntrega.codigoPostal
          }
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
        console.error('Error al crear pago con Mercado Pago:', paymentCreationError);
        
        // Loguear detalles específicos del error de Mercado Pago
        const errorDetails = {
          message: paymentCreationError.message,
          code: paymentCreationError.code,
          status: paymentCreationError.status,
          response: paymentCreationError.response?.data || 'Sin detalles adicionales'
        };

        console.error('Detalles del error de Mercado Pago:', JSON.stringify(errorDetails, null, 2));
        
        res.status(500).json({ 
          error: 'Error al procesar el pago con Mercado Pago',
          details: errorDetails
        });
      }
    } catch (error) {
      console.error('Error inesperado en procesamiento de pago:', error);
      res.status(500).json({ 
        error: 'Error interno al procesar el pago',
        details: {
          message: error.message,
          stack: error.stack
        }
      });
    }
  }

  async verificarEstado(req, res) {
    try {
      const { transactionId } = req.params;
      
      // Verificar inicialización del cliente
      if (!this.client) {
        this.initializeMercadoPago();
        
        if (!this.client) {
          return res.status(500).json({ 
            error: 'Error de configuración de Mercado Pago',
            details: 'No se pudo inicializar el cliente de Mercado Pago'
          });
        }
      }

      const payment = new Payment(this.client);
      const paymentResponse = await payment.get({ id: transactionId });
      
      res.json(paymentResponse);
    } catch (error) {
      console.error('Error al verificar estado del pago:', error);
      res.status(500).json({ 
        error: 'Error al verificar estado del pago',
        details: error.message 
      });
    }
  }
}

export default new PagoController();