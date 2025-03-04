import Joi from 'joi';
import Producto from '../models/producto.js';

const productoSchema = Joi.object({
  titulo: Joi.string().required(),
  precio: Joi.number().required(),
  marca: Joi.string(),
  descripcion: Joi.string(),
  categoria: Joi.string().required(),
  imagen: Joi.string().uri({ scheme: ['http', 'https'] }),
  destacado: Joi.boolean().default(false)
});

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
    const { titulo, precio, marca, categoria, descripcion, imagen, destacado } = req.body;

    try {
      const validationResult = productoSchema.validate(
        { titulo, precio, marca, categoria, descripcion, imagen, destacado },
        { abortEarly: false }
      );

      if (validationResult.error) {
        const erroresDetallados = validationResult.error.details.map((detalle) => detalle.message);
        return res.status(400).json({ error: 'Error de validación', detalles: erroresDetallados });
      }

      const nuevoProducto = new Producto({
        titulo,
        precio,
        categoria,
        marca,
        descripcion,
        imagen,
        destacado: destacado || false
      });
      const productoGuardado = await nuevoProducto.save();
      res.status(201).json(productoGuardado);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar el producto' });
    }
  }

  async updateProducto(req, res) {
    const { id } = req.params;
    const { titulo, precio, marca, descripcion, categoria, imagen, destacado } = req.body;

    try {
      const validationResult = productoSchema.validate(
        { titulo, precio, marca, descripcion, imagen, categoria, destacado },
        { abortEarly: false }
      );

      if (validationResult.error) {
        const erroresDetallados = validationResult.error.details.map((detalle) => detalle.message);
        return res.status(400).json({ error: 'Error de validación', detalles: erroresDetallados });
      }

      const productoActualizado = await Producto.findByIdAndUpdate(
        id,
        { titulo, precio, marca, descripcion, categoria, imagen, destacado },
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