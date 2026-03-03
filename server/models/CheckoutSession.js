const mongoose = require('mongoose');

const checkoutSessionSchema = new mongoose.Schema({
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    guestId: {
        type: String
    },
    status: {
        type: String,
        enum: ['address_selection', 'shipping_method', 'payment_selection', 'review', 'completed'],
        default: 'address_selection'
    },
    // Temporary selected data before final order compilation
    shippingAddressRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    guestShippingAddress: Object, // Embedded if guest
    paymentMethodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod'
    }
}, {
    timestamps: true
});

const CheckoutSession = mongoose.model('CheckoutSession', checkoutSessionSchema);
module.exports = CheckoutSession;
