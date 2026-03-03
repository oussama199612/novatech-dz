const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, // Optional if guest
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'DZD' // Algerian Dinar
    },
    provider: {
        type: String, // e.g. BaridiMob, COD (Cash on Delivery)
        required: true
    },
    transactionId: {
        type: String // External provider's transaction ID
    },
    status: {
        type: String,
        enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
