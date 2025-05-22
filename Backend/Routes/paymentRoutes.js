import express from "express";
import { createOrder, verifyPayment } from "../Controllers/paymentController.js";
import verifyCart from "../middleware/verifyCart.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", protect, verifyCart, createOrder);

// Verify payment and confirm order
router.post("/verify", verifyCart, verifyPayment);

export default router;