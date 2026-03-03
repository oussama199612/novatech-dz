const admin = require('../config/firebase');
const User = require('../models/User');
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

            // Find the user in our DB using the firebaseUid
            // We'll also fall back to identifying them by email if the UID isn't saved yet
            const user = await User.findOne({
                $or: [{ firebaseUid }, { email: decodedToken.email }]
            }).select('-password');

            if (!user) {
                res.status(401);
                throw new Error('Customer account not found in database');
            }

            // Important: if we matched by email but they didn't have a UID yet, save it now
            if (!user.firebaseUid) {
                user.firebaseUid = firebaseUid;
                await user.save();
            }

            req.customer = user; // keep 'req.customer' name for backward compatibility with existing routes
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
