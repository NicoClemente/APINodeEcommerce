import express from 'express';
import usuarioController from '../controllers/usuarioController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/registro', usuarioController.registro);
router.post('/login', usuarioController.login);

// Verificar que todas las funciones del controlador existen antes de usar las rutas
if (usuarioController.getUsuarios && 
    usuarioController.getUsuarioById && 
    usuarioController.updateUsuario && 
    usuarioController.deleteUsuario) {
    
    // Rutas protegidas con middleware
    router.use(verifyToken);

    // Rutas admin
    router.get('/usuarios', isAdmin, usuarioController.getUsuarios);
    router.get('/usuarios/:id', isAdmin, usuarioController.getUsuarioById);
    router.put('/usuarios/:id', isAdmin, usuarioController.updateUsuario);
    router.delete('/usuarios/:id', isAdmin, usuarioController.deleteUsuario);
} else {
    console.error('Algunas funciones del controlador no están definidas');
}

export default router;