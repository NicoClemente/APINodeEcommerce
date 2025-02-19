import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from './config/database.js';
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";
import authRoutes from "./routes/auth.js";
import pagoRoutes from "./routes/pago.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ecommerce-electronica-cs.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (process.env.ALLOWED_ORIGINS?.split(',').includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/pagos", pagoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API funcionando correctamente',
    version: '1.0.0'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});

export default app;