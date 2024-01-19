import Carrito from '../models/carrito.js';

function validarProductoEnCarrito({ productoId, cantidad }) {
  const errores = [];

  if (!productoId || typeof productoId !== 'string') {
    errores.push('El ID del producto es requerido y debe ser una cadena de texto.');
  }

  if (cantidad === undefined || !Number.isInteger(cantidad) || cantidad < 1) {
    errores.push('La cantidad es requerida y debe ser un número entero mayor que cero.');
  }

  return errores;
}

function validarDireccionEntrega({ calle, ciudad, codigoPostal }) {
  const errores = [];

  if (!calle || typeof calle !== 'string') {
    errores.push('La calle es requerida y debe ser una cadena de texto.');
  }

  if (!ciudad || typeof ciudad !== 'string') {
    errores.push('La ciudad es requerida y debe ser una cadena de texto.');
  }

  if (!codigoPostal || typeof codigoPostal !== 'string') {
    errores.push('El código postal es requerido y debe ser una cadena de texto.');
  }

  return errores;
}

class CarritoController {
  async getCarrito(req, res) {
    try {
      const carrito = await Carrito.find().populate('items.productoId');
      res.json(carrito || []);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el carrito' });
    }
  }

  async agregarAlCarrito(req, res) {
    const { items, direccionEntrega, total } = req.body;

    const erroresItems = items.reduce((errores, item) => {
      const productoErrores = validarProductoEnCarrito(item);
      return errores.concat(productoErrores);
    }, []);

    const erroresDireccion = validarDireccionEntrega(direccionEntrega);

    if (erroresItems.length > 0 || erroresDireccion.length > 0 || !total) {
      const erroresTotales = erroresItems.concat(erroresDireccion);
      return res.status(400).json({ error: 'Error de validación', detalles: erroresTotales });
    }

    try {
      const nuevoCarrito = new Carrito({
        items,
        direccionEntrega,
        total,
      });

      await nuevoCarrito.save();

      res.status(201).json(nuevoCarrito);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar productos al carrito' });
    }
  }
}

export default new CarritoController();
