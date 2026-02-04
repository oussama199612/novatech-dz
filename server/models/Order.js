const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, // Short readable ID
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    gameId: { type: String }, // Optional field for Game ID

    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
    }],

    totalAmount: { type: Number, required: true },

    paymentMethodId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
    paymentMethodSnapshot: { // Store method details at time of order
        name: String,
        accountLabel: String,
        accountValue: String
    },

    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'paid', 'delivered', 'cancelled']
    },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
