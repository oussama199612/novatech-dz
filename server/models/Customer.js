const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String, // Kept for legacy, but not required for new Firebase users
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    emailVerifyToken: {
        type: String
    },
    phoneVerifyOtp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Method to compare entered password to hashed password in database
customerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
customerSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
