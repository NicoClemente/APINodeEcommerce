import express from "express";
import multer from "multer";
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
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
});

// Ruta para subir imágenes (protegida para administradores)
router.post("/image", verifyToken, isAdmin, upload.single('image'), async (req, res) => {
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
      folder: 'productos', // Opcional: carpeta donde guardar en Cloudinary
      resource_type: 'auto' // Detectar automáticamente el tipo de recurso
    });

    res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      message: "Imagen subida correctamente a Cloudinary"
    });
  } catch (error) {
    console.error("Error al subir la imagen a Cloudinary:", error);
    res.status(500).json({ error: "Error al procesar la imagen" });
  }
});

// Manejar errores de multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error de multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: "El archivo es demasiado grande. Máximo 5MB." });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Otros errores
    return res.status(500).json({ error: err.message });
  }
  next();
});

export default router;