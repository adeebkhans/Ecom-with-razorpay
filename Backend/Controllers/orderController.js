import Order from "../models/Order.js";
import mongoose from "mongoose";

export const getOrdersByStatus = async (req, res) => {
    try {
        const { status, secretKey } = req.body; // Admin key sent in body

        // Admin Authentication
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: "Unauthorized: Invalid admin key" });
        }

        // Validate Order Status
        if (!status || !["Pending", "Paid", "Shipped", "Delivered", "Cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid or missing order status" });
        }

        // Fetch Orders
        const orders = await Order.find({ status }).populate("userId", "name email").sort({ createdAt: -1 }); // Sort in descending order (latest orders first);

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { newStatus, secretKey } = req.body;

        // Admin Authentication
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: "Unauthorized: Invalid admin key" });
        }

        // Validate Status
        if (!["Pending", "Paid", "Shipped", "Delivered", "Cancelled"].includes(newStatus)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        // Update Order
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ success: true, message: "Order status updated", updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getOrderbyId = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid Order ID" });
        }

        const order = await Order.findById(orderId).populate("items.productId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
