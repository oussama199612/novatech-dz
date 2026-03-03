const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // 1-to-1 relationship with User
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date
    },
    preferences: {
        language: {
            type: String,
            default: 'fr'
        },
        marketingOptIn: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema);
module.exports = CustomerProfile;
