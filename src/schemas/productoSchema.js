import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: true 
  },
  precio: { 
    type: Number, 
    required: true 
  },
  marca: String,
  descripcion: String,
  categoria: { 
    type: String, 
    required: true 
  },
  imagen: { 
    type: String, 
    required: true 
  },
  destacado: {
    type: Boolean,
    default: false
  }
}, { 
  versionKey: false 
});

export default productoSchema;