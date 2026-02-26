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
    locationsStock: [{
        store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
        stock: { type: Number, default: 0 }
    }],
    // Phase 1: Core & Organization
    vendor: { type: String },
    productType: { type: String },
    tags: [{ type: String }],
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },

    // Phase 2: Pricing & Inventory
    compareAtPrice: { type: Number, default: 0 }, // For promos
    costPerItem: { type: Number, default: 0 }, // For profit calc

    sku: { type: String },
    barcode: { type: String },
    trackQuantity: { type: Boolean, default: true },
    continueSellingWhenOutOfStock: { type: Boolean, default: false },

    weight: { type: Number, default: 0 },
    weightUnit: { type: String, default: 'kg' },

    // Phase 3: Variants
    hasVariants: { type: Boolean, default: false },
    options: [{
        name: { type: String }, // e.g., "Size", "Color"
        values: [{ type: String }] // e.g., ["S", "M"], ["Red", "Blue"]
    }],
    variants: [{
        title: { type: String }, // e.g., "S / Red"
        price: { type: Number, default: 0 },
        compareAtPrice: { type: Number, default: 0 },
        costPerItem: { type: Number, default: 0 },
        sku: { type: String },
        barcode: { type: String },
        stock: { type: Number, default: 0 },
        locationsStock: [{
            store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
            stock: { type: Number, default: 0 }
        }],
        trackQuantity: { type: Boolean, default: true },
        image: { type: String } // Variant specific image
    }],

    gallery: [{ type: String }],
    features: [{
        icon: { type: String },
        title: { type: String },
        description: { type: String }
    }],
    offers: [{
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        label: { type: String },
        isBestValue: { type: Boolean, default: false }
    }],
    longDescription: { type: String },
    accentColor: { type: String, default: '#3b82f6' },
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
