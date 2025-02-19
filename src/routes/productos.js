import express from "express";
import productosController from "../controllers/productosController.js";
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.get("/", productosController.getAllProductos);
router.get("/:id", productosController.getProductoById);

// Rutas protegidas (admin)
router.post("/", verifyToken, isAdmin, productosController.addProducto);
router.put("/:id", verifyToken, isAdmin, productosController.updateProducto);
router.delete("/:id", verifyToken, isAdmin, productosController.deleteProducto);

export default router;