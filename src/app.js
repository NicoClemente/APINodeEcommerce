import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from './config/database.js';
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";
import authRoutes from "./routes/auth.js";
import pagoRoutes from "./routes/pago.js";
import uploadRoutes from "./routes/upload.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Registro de orígenes permitidos
console.log('Orígenes CORS permitidos:', allowedOrigins);

// Configuración CORS
app.use(cors({
  origin: function (origin, callback) {
    console.log('Origen de la solicitud:', origin); // Añadir este log para depuración
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Origen no permitido:', origin); // Registro de orígenes no permitidos
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// Middleware de registro de solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

connectDB();

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/upload", uploadRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API funcionando correctamente',
    version: '1.0.0'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error detallado:', {
    mensaje: err.message,
    pila: err.stack,
    ruta: req.originalUrl,
    metodo: req.method
  });
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  console.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
  console.log(`Orígenes CORS permitidos: ${allowedOrigins}`);
});

export default app;