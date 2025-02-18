import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import productosRoutes from "./routes/productos.js";
import carritoRoutes from "./routes/carrito.js";

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB Atlas usando la variable de entorno
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB: "));
db.once("open", function () {
  console.log("Conexión establecida con MongoDB Atlas");
});

app.use(express.json());
app.use("/formulario", express.static("public"));
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", carritoRoutes);

try {
  const server = app.listen(PORT, () => {
    console.log("Aplicación corriendo en puerto", server.address().port);
  });

  server.on("error", (error) => {
    console.error("Error en servidor:", error.message);
  });

  process.on("exit", () => {
    console.log("Desconexión de la base de datos");
    mongoose.disconnect();
  });
} catch (error) {
  console.error(error);
}