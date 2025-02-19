// src/models/usuario.js
import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  nombre: { 
    type: String, 
    required: true 
  },
  rol: { 
    type: String, 
    enum: ['admin', 'cliente'], 
    default: 'cliente' 
  }
}, { 
  timestamps: true,
  versionKey: false 
});

export default mongoose.model('Usuario', usuarioSchema);