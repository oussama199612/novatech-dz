const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const asyncHandler = require('express-async-handler');
const { protectCustomer } = require('../middleware/customerAuthMiddleware');

// @desc    Register a new customer (Sync from Firebase)
// @route   POST /api/customers/register
// @access  Public
router.post('/register', asyncHandler(async (req, res, next) => {
    const { firebaseUid, firstName, lastName, email, phone } = req.body;

    const customerExists = await Customer.findOne({ $or: [{ email }, { phone }, { firebaseUid }] });

    if (customerExists) {
        // If it exists, maybe just update the firebaseUid if missing
        if (!customerExists.firebaseUid && firebaseUid) {
            customerExists.firebaseUid = firebaseUid;
            await customerExists.save();
        }
        res.status(200).json(customerExists);
        return;
    }

    const customer = await Customer.create({
        firebaseUid,
        firstName,
        lastName,
        email,
        phone,
        isEmailVerified: false,
        isPhoneVerified: false
    });

    if (customer) {
        res.status(201).json(customer);
    } else {
        res.status(400);
        throw new Error('Invalid customer data');
    }
}));

// @desc    Verify Phone (Sync verified status)
// @route   POST /api/customers/verify-phone
// @access  Private
router.post('/verify-phone', protectCustomer, asyncHandler(async (req, res, next) => {
    const customer = await Customer.findById(req.customer._id);

    if (!customer) {
        res.status(404);
        throw new Error('Customer not found');
    }

    customer.isPhoneVerified = true;
    await customer.save();

    res.json({ message: 'Phone verification status synced successfully' });
}));

// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Private
router.get('/profile', protectCustomer, asyncHandler(async (req, res, next) => {
    const customer = await Customer.findById(req.customer._id).select('-password');
    if (customer) {
        res.json(customer);
    } else {
        res.status(404);
        throw new Error('Customer not found');
    }
}));

module.exports = router;
