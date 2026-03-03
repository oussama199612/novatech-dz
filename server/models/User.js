const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined if registered differently, though mostly firebase now
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        sparse: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'moderator'],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['active', 'banned', 'pending_verification'],
        default: 'active'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
