const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const asyncHandler = require('express-async-handler');
const { protectCustomer } = require('../middleware/customerAuthMiddleware');

// Helper to preserve frontend data contract
const formatUserResponse = (user, profile) => {
    return {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        phone: user.phone,
        firstName: profile ? profile.firstName : 'Utilisateur',
        lastName: profile ? profile.lastName : '',
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        role: user.role
    };
};
// @desc    Register a new customer (Sync from Firebase)
// @route   POST /api/customers/register
// @access  Public
router.post('/register', asyncHandler(async (req, res, next) => {
    const { firebaseUid, firstName, lastName, email, phone } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }, { firebaseUid }] });

    if (userExists) {
        let updated = false;
        if (!userExists.firebaseUid && firebaseUid) {
            userExists.firebaseUid = firebaseUid;
            updated = true;
        }
        if ((!userExists.phone || userExists.phone === '0000000000') && phone) {
            userExists.phone = phone;
            updated = true;
        }
        if (updated) await userExists.save();

        const profile = await CustomerProfile.findOne({ user: userExists._id });
        if (profile) {
            let profileUpdated = false;
            if ((profile.firstName === 'Utilisateur' || !profile.firstName) && firstName) {
                profile.firstName = firstName;
                profileUpdated = true;
            }
            if ((profile.lastName === ' ' || !profile.lastName) && lastName) {
                profile.lastName = lastName;
                profileUpdated = true;
            }
            if (profileUpdated) await profile.save();
        }

        res.status(200).json(formatUserResponse(userExists, profile));
        return;
    }

    const user = await User.create({
        firebaseUid,
        email,
        phone,
        isEmailVerified: false,
        isPhoneVerified: false
    });

    if (user) {
        const profile = await CustomerProfile.create({
            user: user._id,
            firstName,
            lastName
        });
        res.status(201).json(formatUserResponse(user, profile));
    } else {
        res.status(400);
        throw new Error('Une erreur s\'est produite lors de la création de votre profil. Veuillez réessayer.');
    }
}));

// @desc    Verify Phone (Sync verified status)
// @route   POST /api/customers/verify-phone
// @access  Private
router.post('/verify-phone', protectCustomer, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.customer._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isPhoneVerified = true;
    await user.save();

    res.json({ message: 'Phone verification status synced successfully' });
}));

// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Private
router.get('/profile', protectCustomer, asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.customer._id);
    if (user) {
        // Sync email verification status from Firebase
        try {
            const admin = require('../config/firebase');
            if (user.firebaseUid) {
                const firebaseUser = await admin.auth().getUser(user.firebaseUid);
                if (firebaseUser.emailVerified && !user.isEmailVerified) {
                    user.isEmailVerified = true;
                    // Mongoose requires saving the updated document
                    await user.save();
                }
            }
        } catch (error) {
            console.error('Error fetching firebase user status:', error);
        }
        const profile = await CustomerProfile.findOne({ user: user._id });
        res.json(formatUserResponse(user, profile));
    } else {
        // AUTOSYNC RECOVERY: If Firebase Token is valid but MongoDB profile is missing, reconstruct it
        if (req.customer) {
            res.status(404);
            throw new Error('User not found');
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

            // Check if user exists by email or uid
            let user = await User.findOne({ $or: [{ firebaseUid }, { email: decodedToken.email }] });

            if (user) {
                // Return existing
                if (!user.firebaseUid) {
                    user.firebaseUid = firebaseUid;
                    await user.save();
                }
                const profile = await CustomerProfile.findOne({ user: user._id });
                res.json(formatUserResponse(user, profile));
            } else {
                // Recover/Create new DB record based on Firebase Token info
                const nameParts = decodedToken.name ? decodedToken.name.split(' ') : [];
                const firstName = nameParts[0] || decodedToken.email.split('@')[0] || 'Utilisateur';
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

                user = await User.create({
                    firebaseUid: firebaseUid,
                    email: decodedToken.email,
                    phone: decodedToken.phone_number || undefined,
                    isEmailVerified: decodedToken.email_verified || false,
                    isPhoneVerified: false
                });

                const profile = await CustomerProfile.create({
                    user: user._id,
                    firstName: firstName,
                    lastName: lastName
                });

                res.status(201).json(formatUserResponse(user, profile));
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
