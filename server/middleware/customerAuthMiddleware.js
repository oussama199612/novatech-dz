const admin = require('../config/firebase');
const Customer = require('../models/Customer');
const asyncHandler = require('express-async-handler');

const protectCustomer = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify the Firebase ID token
            const decodedToken = await admin.auth().verifyIdToken(token);
            const firebaseUid = decodedToken.uid;

            // Find the customer in our DB using the firebaseUid
            // We'll also fall back to identifying them by email if the UID isn't saved yet (during first sync)
            const customer = await Customer.findOne({
                $or: [{ firebaseUid }, { email: decodedToken.email }]
            }).select('-password');

            if (!customer) {
                res.status(401);
                throw new Error('Customer account not found in database');
            }

            // Important: if we matched by email but they didn't have a UID yet (from before the migration), save it now
            if (!customer.firebaseUid) {
                customer.firebaseUid = firebaseUid;
                await customer.save();
            }

            req.customer = customer;
            next();
        } catch (error) {
            console.error('Firebase Auth Error:', error);
            res.status(401);
            throw new Error('Not authorized, token failed: ' + error.message);
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protectCustomer };
