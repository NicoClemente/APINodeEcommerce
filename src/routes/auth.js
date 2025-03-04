import express from 'express';
import usuarioController from '../controllers/usuarioController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', usuarioController.registro);
router.post('/login', usuarioController.login);

// Rutas protegidas - aplicar middleware de verificación
router.use(verifyToken);

// Rutas de perfil de usuario (accesibles para cualquier usuario autenticado)
if (usuarioController.updateProfile && usuarioController.changePassword) {
    router.put('/perfil', usuarioController.updateProfile);
    router.put('/cambiar-password', usuarioController.changePassword);
} else {
    console.error('Las funciones de perfil no están definidas en el controlador');
}

// Rutas de administrador
if (usuarioController.getUsuarios && 
    usuarioController.getUsuarioById && 
    usuarioController.updateUsuario && 
    usuarioController.deleteUsuario) {
    
    router.get('/usuarios', isAdmin, usuarioController.getUsuarios);
    router.get('/usuarios/:id', isAdmin, usuarioController.getUsuarioById);
    router.put('/usuarios/:id', isAdmin, usuarioController.updateUsuario);
    router.delete('/usuarios/:id', isAdmin, usuarioController.deleteUsuario);
} else {
    console.error('Algunas funciones de administrador no están definidas');
}

export default router;