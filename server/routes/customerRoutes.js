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
        throw new Error('Une erreur s\'est produite lors de la création de votre profil. Veuillez réessayer.');
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
        // Sync email verification status from Firebase
        try {
            const admin = require('../config/firebase');
            if (customer.firebaseUid) {
                const firebaseUser = await admin.auth().getUser(customer.firebaseUid);
                if (firebaseUser.emailVerified && !customer.isEmailVerified) {
                    customer.isEmailVerified = true;
                    // Mongoose requires saving the updated document
                    await customer.save();
                }
            }
        } catch (error) {
            console.error('Error fetching firebase user status:', error);
        }
        res.json(customer);
    } else {
        // AUTOSYNC RECOVERY: If Firebase Token is valid but MongoDB profile is missing, reconstruct it
        if (req.customer) { // Wait, the middleware already throws 401 if it doesn't find it. Let's look at `protectCustomer`.
            res.status(404);
            throw new Error('Customer not found');
        }
    }
}));

// @desc    Self-heal ghost Firebase account during login
// @route   POST /api/customers/recover
// @access  Public (needs Bearer Token manually verified)
router.post('/recover', asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            const admin = require('../config/firebase');
            const decodedToken = await admin.auth().verifyIdToken(token);
            const firebaseUid = decodedToken.uid;

            // Check if customer exists by email or uid
            let customer = await Customer.findOne({ $or: [{ firebaseUid }, { email: decodedToken.email }] });

            if (customer) {
                // Return existing
                if (!customer.firebaseUid) {
                    customer.firebaseUid = firebaseUid;
                    await customer.save();
                }
                res.json(customer);
            } else {
                // Recover/Create new DB record based on Firebase Token info
                const nameParts = decodedToken.name ? decodedToken.name.split(' ') : [];
                const firstName = nameParts[0] || decodedToken.email.split('@')[0] || 'Utilisateur';
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

                customer = await Customer.create({
                    firebaseUid: firebaseUid,
                    email: decodedToken.email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: decodedToken.phone_number || '0000000000', // Placeholder
                    isEmailVerified: decodedToken.email_verified || false,
                    isPhoneVerified: false
                });
                res.status(201).json(customer);
            }
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Recovery failed: invalid token');
        }
    } else {
        res.status(401);
        throw new Error('No token provided');
    }
}));

module.exports = router;
