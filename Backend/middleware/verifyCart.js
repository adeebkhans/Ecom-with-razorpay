import mongoose from "mongoose";
import Product from "../models/Product.js";

const verifyCart = async (req, res, next) => {
    try {
        // Extract verifiedCart from req.body as per the provided format
        const { verifiedCart: cartItems } = req.body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty or invalid" });
        }

        let totalAmount = 0;
        let verifiedCartDetails = []; // Changed variable name to avoid confusion

        for (const item of cartItems) {
            const { productId, quantity, price } = item;

            // Validate productId format
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: `Invalid product ID: ${productId}` });
            }

            // Fetch product details from DB
            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({ message: `Product with ID ${productId} not found` });
            }

            // Verify price - Removed price verification as per updated request body structure , if needed can be added back
            // if (product.price !== price) {
            //     return res.status(400).json({ message: `Price mismatch for ${product.title}` });
            // }

            if (product.stock < quantity) {
                return res.status(400).json({ message: `Not enough stock for ${product.title}` });
            }

            // Calculate total amount (applying discount)
            const discountedPrice = product.price - (product.price * product.discountPercentage) / 100;
            totalAmount += discountedPrice * quantity;

            // Add verified product to cart
            verifiedCartDetails.push({ // Changed variable name here as well
                productId: product._id,
                title: product.title,
                quantity,
                price: discountedPrice,
                total: discountedPrice * quantity,
            });
        }

        // Attach verified cart and total to request
        req.verifiedCart = verifiedCartDetails; // Updated to new variable name
        req.totalAmount = totalAmount;

        next(); // Proceed to the next middleware (checkout)
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export default verifyCart;