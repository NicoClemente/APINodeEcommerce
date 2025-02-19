import express from 'express';
import usuarioController from '../controllers/usuarioController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', usuarioController.registro);
router.post('/login', usuarioController.login);

// Rutas protegidas
router.get('/usuarios', verifyToken, isAdmin, usuarioController.getUsuarios);
router.get('/usuarios/:id', verifyToken, usuarioController.getUsuarioById);
router.put('/usuarios/:id', verifyToken, isAdmin, usuarioController.updateUsuario);
router.delete('/usuarios/:id', verifyToken, isAdmin, usuarioController.deleteUsuario);

export default router;