import express from 'express';
import carritoController from '../controllers/carritoController.js';

const router = express.Router();
router.use(express.urlencoded({ extended: true }));

router.get('/', carritoController.getCarrito);

router.post('/', carritoController.agregarAlCarrito);

export default router;
