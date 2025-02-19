// src/routes/auth.js
import express from 'express';
import usuarioController from '../controllers/usuarioController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', usuarioController.registro);
router.post('/login', usuarioController.login);

// Rutas protegidas
router.use(verifyToken);

// Rutas solo para admin
router.get('/usuarios', isAdmin, usuarioController.getUsuarios);
router.get('/usuarios/:id', isAdmin, usuarioController.getUsuarioById);
router.put('/usuarios/:id', isAdmin, usuarioController.updateUsuario);
router.delete('/usuarios/:id', isAdmin, usuarioController.deleteUsuario);

export default router;