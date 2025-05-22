import Product from "../models/Product.js";

// @desc Add new product (Requires Secret Key)
// @route POST /api/products
// @access Private (Admin only)
export const addProduct = async (req, res) => {
    try {
        const { secretKey, title, description, price, discountPercentage, rating, stock, thumbnail, images } = req.body;

        // Verify Secret Key
        if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: "Unauthorized: Invalid secret key" });
        }

        // Check if product already exists
        const existingProduct = await Product.findOne({ title });
        if (existingProduct) {
            return res.status(400).json({ message: "Product already exists" });
        }

        // Create a new product
        const product = new Product({ title, description, price, discountPercentage, rating, stock, thumbnail, images });
        const savedProduct = await product.save();

        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc Update an existing product (Requires Secret Key)
// @route PUT /api/products/:id
// @access Private (Admin only)
export const updateProduct = async (req, res) => {
    try {
        const { secretKey } = req.body;
        const { id } = req.params;

        // Verify Secret Key
        if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: "Unauthorized: Invalid secret key" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


// @desc Get all products
// @route GET /api/products
// @access Public
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products from DB
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc Get product by ID
// @route GET /api/products/:id
// @access Public
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id); // Fetch product by ID

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

