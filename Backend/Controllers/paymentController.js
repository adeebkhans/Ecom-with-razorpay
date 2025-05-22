import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc Create a Razorpay Order
// @route POST /api/payment/create-order
// @access Public
export const createOrder = async (req, res) => {
    try {
        const { totalAmount } = req.body;

        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: "Invalid total amount" });
        }

        // Create Razorpay Order
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: "INR",
            receipt: `order_rcpt_${Date.now()}`,
            payment_capture: 1, // Auto-capture payment
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            currency: order.currency,
            amount: order.amount / 100,
        });
    } catch (error) {
        console.error("Error in createOrder:", error);

        res.status(500).json({
            message: "Payment initiation failed. Please try again later.",
            error: process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
        });
    }
};

// @desc Verify Payment and Confirm Order
// @route POST /api/payment/verify
// @access Public
export const verifyPayment = async (req, res) => {
    try {
        console.log(req.body);
        // Declare totalAmount with let here
        let totalAmount = 0;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, verifiedCart, userId, shippingAddress } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Payment details are missing" });
        }

        // Generate expected signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // Decrement stock for each purchased product and prepare items for order saving
        let orderItems = []; // Array to hold items in the format for Order model
        for (const item of verifiedCart) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found during verification.` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.title} during verification.` });
            }

            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }, // Reduce stock by purchased quantity
                { new: true }
            );

            const discountedPrice = product.price - (product.price * product.discountPercentage) / 100;
            const itemTotal = discountedPrice * item.quantity; // Calculate total for each item

            orderItems.push({ // Format item to match Order model
                productId: product._id, // Use product._id (ObjectId from DB)
                title: product.title,
                quantity: item.quantity,
                price: discountedPrice,
                total: itemTotal, // Include total here
            });
            totalAmount += itemTotal; // Now this is allowed as totalAmount is declared with let
        }


        // Save order in database
        const newOrder = new Order({
            userId: userId !== "user_id_placeholder" ? userId : null, // Use null for guest users if userId is placeholder
            items: orderItems, // Use orderItems which now includes 'total'
            totalAmount,
            shippingAddress, // Now included in order saving
            paymentId: razorpay_payment_id,
            status: "Paid",
        });

        await newOrder.save();

        res.json({ success: true, message: "Payment verified and order confirmed", orderId: newOrder._id });
    } catch (error) {
        console.error("Error in verifyPayment:", error);
        res.status(500).json({ message: "Payment verification failed", error: error.message });
    }
};