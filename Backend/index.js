import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './Routes/userRoutes.js'; 
import productRoutes from './Routes/productRoutes.js'; 
import paymentRoutes from './Routes/paymentRoutes.js'; 
import orderRoutes from './Routes/orderRoutes.js'; 
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Allow frontend origin
    credentials: true // Allow cookies if using authentication
  }));

app.use(express.json()); 
app.use(cookieParser());


// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));