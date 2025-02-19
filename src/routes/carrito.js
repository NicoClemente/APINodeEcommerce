import express from 'express';
import carritoController from '../controllers/carritoController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', carritoController.getCarrito);
router.get('/:id', carritoController.getCarritoById);
router.post('/', carritoController.agregarAlCarrito);
router.delete('/:id', carritoController.eliminarCarrito);

export default router;