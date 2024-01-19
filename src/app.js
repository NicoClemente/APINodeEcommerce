import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // 
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";

// Configuración de variables de entorno
dotenv.config();

// Inicialización de Express
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Conexión establecida con MongoDB");
})
.catch((error) => {
  console.error("Error al conectar con MongoDB:", error.message);
});


// Configuración de rutas
app.use(express.json());
app.use("/formulario", express.static("public"));
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);

// Iniciar servidor
try {
  app.listen(PORT, () => {
    console.log("Aplicación corriendo en puerto", PORT);
  });
} catch (error) {
  console.error(error);
}
