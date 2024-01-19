import mongoose from 'mongoose';

const carritoItemSchema = new mongoose.Schema({
  productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, default: 1 },
});

const carritoSchema = new mongoose.Schema({
  items: [carritoItemSchema],
  direccionEntrega: {
    calle: { type: String, required: true },
    ciudad: { type: String, required: true },
    codigoPostal: { type: String, required: true },
  },
  total: { type: Number, required: true },
}, { versionKey: false });

const Carrito = mongoose.model('Carrito', carritoSchema);

export default Carrito;
