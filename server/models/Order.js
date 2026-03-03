const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, // Short readable ID
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional link to registered User
    guestId: { type: String }, // For unauthenticated checkouts

    // Contact snapshot at time of order
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },

    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }, // Store origin

    // Links to child documents (snapshot pattern)
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },

    totalAmount: { type: Number, required: true },

    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
