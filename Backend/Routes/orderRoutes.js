import express from "express";
import { getOrderbyId, getOrdersByStatus, updateOrderStatus } from "../Controllers/orderController.js";

const router = express.Router();

router.post("/getAll", getOrdersByStatus);

router.get("/getById/:orderId", getOrderbyId);

router.put("/update/:orderId", updateOrderStatus);

export default router;
