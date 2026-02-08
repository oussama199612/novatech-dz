const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/authMiddleware');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            email: admin.email,
            token: generateToken(admin._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
}));

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.user._id);
    if (admin) {
        res.json({
            _id: admin._id,
            email: admin.email,
        })
    } else {
        res.status(404);
        throw new Error('User not found');
    }
}));

// @desc    Rescue default admin (Use for first setup if seeder fails)
// @route   GET /api/auth/rescue-admin
// @access  Public
router.get('/rescue-admin', asyncHandler(async (req, res) => {
    const adminExists = await Admin.findOne({ email: 'admin@novatech.com' });

    if (adminExists) {
        adminExists.password = 'password123'; // Reset password to default
        await adminExists.save();
        res.json({ message: 'Admin exists. Password reset to: password123' });
    } else {
        const admin = await Admin.create({
            email: 'admin@novatech.com',
            password: 'password123'
        });
        res.status(201).json({
            message: 'Admin created successfully',
            credentials: {
                email: 'admin@novatech.com',
                password: 'password123'
            }
        });
    }
}));

module.exports = router;
