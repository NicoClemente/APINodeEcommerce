import express from 'express';
import pagoController from '../controllers/pagoController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/procesar', pagoController.procesarPago);
router.get('/verificar/:transactionId', pagoController.verificarEstado);

export default router;