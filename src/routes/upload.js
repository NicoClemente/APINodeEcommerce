import express from "express";
import multer from "multer";
import path from "path";
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configurar almacenamiento para multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/')); 
  },
  filename: function(req, file, cb) {
    // Generar un nombre de archivo único para evitar conflictos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'producto-' + uniqueSuffix + ext);
  }
});

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
    fileSize: 5 * 1024 * 1024
  }
});

// Ruta para subir imágenes (protegida para administradores)
router.post("/image", verifyToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    // Construir la URL de la imagen
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      message: "Imagen subida correctamente"
    });
  } catch (error) {
    console.error("Error al subir la imagen:", error);
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