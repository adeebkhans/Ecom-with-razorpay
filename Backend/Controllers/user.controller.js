import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register User
// @route POST /api/users/register
// @access Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create New User
        user = await User.create({ name, email, password: hashedPassword });

        // Generate Token
        const token = generateToken(user.id);

        // Set Token in Cookies
        res.cookie('token', token, {
            httpOnly: true, // Prevents client-side JS access
            sameSite: 'strict', // Protects against CSRF
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc Login User
// @route POST /api/users/login
// @access Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        // Validate Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        // Generate Token
        const token = generateToken(user.id);

        // Set Token in Cookies
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc Guest Login (No Authentication)
// @route POST /api/users/guest-login
// @access Public
const guestLogin = async (req, res) => {
    try {
        const guestUser = {
            id: `guest_${Date.now()}`,
            name: 'Guest User',
            email: `guest_${Date.now()}@example.com`,
        };

        // Generate Token for Guest
        const token = generateToken(guestUser.id);

        // Set Token in Cookies
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({ ...guestUser, token });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export { registerUser, loginUser, guestLogin };
