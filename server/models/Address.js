const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomerProfile',
        required: true
    },
    title: {
        type: String,
        default: 'Domicile'
    },
    firstName: {
        type: String, // in case it differs from profile
    },
    lastName: {
        type: String,
    },
    phone: {
        type: String,
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    wilaya: {
        type: String,
        required: true
    },
    postalCode: {
        type: String
    },
    isDefaultShipping: {
        type: Boolean,
        default: false
    },
    isDefaultBilling: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
