import express from "express";
import { addProduct, updateProduct } from "../Controllers/productController.js";
import { getAllProducts, getProductById } from "../controllers/productController.js";

const router = express.Router();

// Routes for product management
router.post("/admin/add", addProduct); // Add a new product (Requires secretKey in body)
router.put("/admin/update/:id", updateProduct); // Update an existing product (Requires secretKey in body)

router.get("/getAllProducts", getAllProducts);
router.get("/getProduct/:id", getProductById);

export default router;
