import express from "express";
import multer from "multer";
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Configurar multer para almacenar en memoria temporalmente
const storage = multer.memoryStorage();

// Filtro para asegurar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).'), false);
    }
};

// Configurar multer con límites
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024  // Límite de 5MB
    }
}).single('image');

// Ruta para subir imágenes (protegida para administradores)
router.post("/image", (req, res, next) => {
    console.log('Upload Request:', {
        origin: req.headers.origin,
        allowedOrigins: process.env.ALLOWED_ORIGINS
    });
    // Middleware manual de verificación de token
    verifyToken(req, res, (err) => {
        if (err) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        // Verificar rol de admin
        isAdmin(req, res, (adminErr) => {
            if (adminErr) {
                return res.status(403).json({ error: 'Se requieren permisos de administrador' });
            }

            // Usar multer para manejar la carga de archivos
            upload(req, res, async (uploadErr) => {
                if (uploadErr) {
                    return res.status(400).json({ error: uploadErr.message });
                }

                try {
                    if (!req.file) {
                        return res.status(400).json({ error: "No se ha subido ningún archivo" });
                    }

                    // Convertir el archivo a base64
                    const fileStr = req.file.buffer.toString('base64');
                    const fileType = req.file.mimetype;
                    const dataURI = `data:${fileType};base64,${fileStr}`;

                    // Subir a Cloudinary
                    const result = await cloudinary.uploader.upload(dataURI, {
                        folder: 'productos',
                        resource_type: 'auto'
                    });

                    res.status(200).json({
                        success: true,
                        imageUrl: result.secure_url,
                        publicId: result.public_id,
                        message: "Imagen subida correctamente a Cloudinary"
                    });
                } catch (error) {
                    console.error("Error al subir la imagen a Cloudinary:", error);
                    res.status(500).json({
                        error: "Error al procesar la imagen",
                        details: error.message
                    });
                }
            });
        });
    });
});

// Manejar errores generales de la ruta
router.use((err, req, res, next) => {
    console.error('Error en ruta de upload:', err);
    res.status(500).json({
        error: "Error interno del servidor",
        details: err.message
    });
});

export default router;