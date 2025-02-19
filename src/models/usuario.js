import mongoose from 'mongoose';
import usuarioSchema from '../schemas/usuarioSchema.js';

export default mongoose.model('Usuario', usuarioSchema);