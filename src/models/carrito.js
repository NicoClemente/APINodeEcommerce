import mongoose from 'mongoose';
import { carritoSchema } from '../schemas/carritoSchema.js';

export default mongoose.model('Carrito', carritoSchema);