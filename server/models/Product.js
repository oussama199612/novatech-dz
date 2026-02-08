const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    active: { type: Boolean, default: true },
    orderIndex: { type: Number, default: 0 }, // For manual sorting
    stock: { type: Number, default: 0 },
    gallery: [{ type: String }],
    features: [{
        icon: { type: String },
        title: { type: String },
        description: { type: String }
    }],
    longDescription: { type: String },
    accentColor: { type: String, default: '#3b82f6' },
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
