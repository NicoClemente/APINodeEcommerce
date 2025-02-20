import express from 'express';
import pagoController from '../controllers/pagoController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/procesar', verifyToken, pagoController.procesarPago);

router.post('/webhook', pagoController.handleWebhook);

export default router;