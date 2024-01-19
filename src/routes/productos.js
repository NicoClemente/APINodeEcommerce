import express from "express";
const router = express.Router();
import productosController from "../controllers/productosController.js";
router.use(express.urlencoded({ extended: true }));

router.get("/", productosController.getAllProductos);
router.get("/:id", productosController.getProductoById);
router.post("/", productosController.addProducto);
router.put("/:id", productosController.updateProducto);
router.delete("/:id", productosController.deleteProducto);

export default router;
