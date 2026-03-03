const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    // The link back to the product is optional because the product might be deleted later, 
    // but the OrderItem remains as an immutable snapshot.
    productRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    productName: {
        type: String,
        required: true
    },
    variantTitle: {
        type: String
    },
    sku: {
        type: String
    },
    pricePaid: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    taxApplied: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;
