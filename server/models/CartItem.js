const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variantId: {
        type: String // The title or internal ID of the variant
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    priceAtAddition: {
        type: Number, // Saves the price when it was added, though checkout will refresh this
        required: true
    }
}, {
    timestamps: true
});

const CartItem = mongoose.model('CartItem', cartItemSchema);
module.exports = CartItem;
