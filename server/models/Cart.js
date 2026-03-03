const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true // Optional: only if logged in
    },
    guestId: {
        type: String,
        sparse: true // The cookie/device ID for unauthenticated users
    },
    status: {
        type: String,
        enum: ['active', 'abandoned', 'converted'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
