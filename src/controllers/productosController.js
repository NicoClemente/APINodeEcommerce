import Producto from '../models/producto.js';

// Función de validación para la creación y actualización de productos
function validarProducto({ titulo, precio, marca, categoria, descripcion, imagen }) {
  const errores = [];

  if (!titulo || typeof titulo !== 'string') {
    errores.push('El título es requerido y debe ser una cadena de texto.');
  }

  if (precio === undefined || isNaN(precio) || precio <= 0) {
    errores.push('El precio es requerido, debe ser un número mayor que cero.');
  }

  if (marca && typeof marca !== 'string') {
    errores.push('La marca debe ser una cadena de texto.');
  }

  if (!categoria || typeof categoria !== 'string') {
    errores.push('La categoría es requerida y debe ser una cadena de texto.');
  }

  if (descripcion && typeof descripcion !== 'string') {
    errores.push('La descripción debe ser una cadena de texto.');
  }

  if (imagen && typeof imagen !== 'string') {
    errores.push('La URL de la imagen debe ser una cadena de texto.');
  }

  return errores;
}

class ProductosController {
  async getAllProductos(req, res) {
    try {
      const productos = await Producto.find();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
  }

  async getProductoById(req, res) {
    const { id } = req.params;
    try {
      const producto = await Producto.findById(id);
      if (producto) {
        res.json(producto);
      } else {
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el producto' });
    }
  }

  async addProducto(req, res) {
    const { titulo, precio, marca, categoria, descripcion, imagen } = req.body;

    const errores = validarProducto({ titulo, precio, marca, categoria, descripcion, imagen });

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Error de validación', detalles: errores });
    }

    try {
      const nuevoProducto = new Producto({ titulo, precio, categoria, marca, descripcion, imagen });
      await nuevoProducto.save();
      res.status(201).json(nuevoProducto);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar el producto' });
    }
  }

  async updateProducto(req, res) {
    const { id } = req.params;
    const { titulo, precio, marca, descripcion, categoria, imagen } = req.body;

    const errores = validarProducto({ titulo, precio, marca, descripcion, categoria, imagen });

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Error de validación', detalles: errores });
    }

    try {
      const productoActualizado = await Producto.findByIdAndUpdate(
        id,
        { titulo, precio, marca, descripcion, categoria, imagen },
        { new: true }
      );

      if (productoActualizado) {
        res.json(productoActualizado);
      } else {
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  }

  async deleteProducto(req, res) {
    const { id } = req.params;
    try {
      const productoEliminado = await Producto.findByIdAndDelete(id);

      if (productoEliminado) {
        res.json(productoEliminado);
      } else {
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  }
}

export default new ProductosController();
