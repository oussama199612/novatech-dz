const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String }, // e.g. Lucid icon name or URL
    active: { type: Boolean, default: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, {
    timestamps: true
});

// Indexes for better read performance
categorySchema.index({ parentCategory: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
