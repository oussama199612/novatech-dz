const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    carrier: {
        type: String,
        default: 'Yalidine'
    },
    trackingNumber: {
        type: String
    },
    shippingAddress: {
        // We embed the address snapshot here so changes to the Address profile don't break old shipments
        street: { type: String, required: true },
        city: { type: String, required: true },
        wilaya: { type: String, required: true },
        postalCode: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        phone: { type: String }
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'in_transit', 'delivered', 'returned'],
        default: 'pending'
    },
    shippingCost: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Shipment = mongoose.model('Shipment', shipmentSchema);
module.exports = Shipment;
