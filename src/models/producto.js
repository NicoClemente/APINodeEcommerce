import mongoose from 'mongoose';
import productoSchema from '../schemas/productoSchema.js';

export default mongoose.model('Producto', productoSchema);