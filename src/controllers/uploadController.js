import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

class UploadController {
  async uploadImage(req, res) {
    try {
      // Si no hay archivo
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
      }

      // Convertir el archivo a base64
      const fileStr = req.file.buffer.toString('base64');
      const fileType = req.file.mimetype;
      const dataURI = `data:${fileType};base64,${fileStr}`;

      // Subir a Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: 'productos',
        resource_type: 'image'
      });

      res.status(200).json({
        success: true,
        imageUrl: uploadResponse.secure_url,
        publicId: uploadResponse.public_id
      });

    } catch (error) {
      console.error('Error al subir imagen:', error);
      res.status(500).json({
        error: 'Error al procesar la imagen',
        details: error.message
      });
    }
  }
}

export default new UploadController();