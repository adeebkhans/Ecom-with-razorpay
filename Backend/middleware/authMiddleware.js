import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    // Check for token in headers (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // If no token is found, return an error
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Decode Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's a guest user
        if (decoded.id.startsWith('guest_')) {
            req.user = { id: decoded.id, name: "Guest User", email: decoded.email };
            return next(); // Allow guest users to proceed
        }

        // Fetch real user from DB (for logged-in users)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export { protect };
