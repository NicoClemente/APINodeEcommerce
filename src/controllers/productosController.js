import Joi from 'joi';
import Producto from '../models/producto.js';

// Esquema de validación para la creación y actualización de productos
const productoSchema = Joi.object({
  titulo: Joi.string().required(),
  precio: Joi.number().required(),
  marca: Joi.string(),
  descripcion: Joi.string(),
  categoria: Joi.string().required(),
  imagen: Joi.string().uri({ scheme: ['http', 'https'] }),
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
    const { titulo, precio, marca,categoria, descripcion, imagen } = req.body;
    
    try {
      // Validar los datos del producto con el esquema definido
      const validationResult = productoSchema.validate({ titulo, precio, marca, categoria,descripcion, imagen }, { abortEarly: false });

      if (validationResult.error) {
        const erroresDetallados = validationResult.error.details.map((detalle) => detalle.message);
        return res.status(400).json({ error: 'Error de validación', detalles: erroresDetallados });
      }

      // Crear una nueva instancia del modelo Producto
      const nuevoProducto = new Producto({ titulo, precio,categoria, marca, descripcion, imagen });

     // Guardar el nuevo producto en la base de datos
    const productoGuardado = await nuevoProducto.save();

    // Imprimir el resultado con console.log
    console.log("Producto Guardado:", productoGuardado);

    res.status(201).json(productoGuardado);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar el producto' });
    }
  }

  async updateProducto(req, res) {
    const { id } = req.params;
    const { titulo, precio, marca, descripcion,categoria, imagen } = req.body;

    try {
      // Validar los datos del producto con el esquema definido
      const validationResult = productoSchema.validate({ titulo, precio, marca, descripcion, imagen, categoria}, { abortEarly: false });

      if (validationResult.error) {
        const erroresDetallados = validationResult.error.details.map((detalle) => detalle.message);
        return res.status(400).json({ error: 'Error de validación', detalles: erroresDetallados });
      }

      // Actualizar el producto en la base de datos
      const productoActualizado = await Producto.findByIdAndUpdate(
        id,
        { titulo, precio, marca, descripcion,categoria, imagen },
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
      // Eliminar el producto de la base de datos
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