const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const filters = { ...keyword };

    if (req.query.vendor) {
        filters.vendor = req.query.vendor;
    }

    if (req.query.tags) {
        const tagsArray = req.query.tags.split(',').map(tag => tag.trim());
        if (tagsArray.length > 0) {
            filters.tags = { $in: tagsArray };
        }
    }

    if (req.query.category && req.query.category !== 'all') {
        filters.category = req.query.category;
    }

    // Handle "active" status for public view if needed, but for now we show all or filter by status if passed
    if (req.query.status) {
        filters.status = req.query.status;
    }

    const products = await Product.find(filters).populate('category').sort({ orderIndex: 1, createdAt: -1 });
    res.json(products);
}));

// @desc    Get all available filters (vendors, tags)
// @route   GET /api/products/filters
// @access  Public
router.get('/filters', asyncHandler(async (req, res) => {
    const vendors = await Product.distinct('vendor');
    const tags = await Product.distinct('tags');
    // Filter out null/undefined/empty
    const cleanVendors = vendors.filter(v => v);
    const cleanTags = tags.filter(t => t);

    res.json({
        vendors: cleanVendors,
        tags: cleanTags
    });
}));

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, asyncHandler(async (req, res) => {
    const {
        name, price, description, image, category, stock,
        gallery, features, longDescription, accentColor,
        vendor, productType, tags, status, compareAtPrice,
        costPerItem, sku, barcode, trackQuantity, continueSellingWhenOutOfStock, weight, weightUnit,
        hasVariants, options, variants,
        offers
    } = req.body;

    const product = new Product({
        name,
        price,
        description,
        image,
        category,
        stock,
        gallery,
        features,
        longDescription,
        accentColor,
        vendor,
        productType,
        tags,
        status,
        compareAtPrice,
        costPerItem,
        sku,
        barcode,
        trackQuantity,
        continueSellingWhenOutOfStock,
        weight,
        weightUnit,
        hasVariants,
        options,
        variants,
        offers
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
}));

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const {
        name, price, description, image, category, active, stock, orderIndex,
        gallery, features, longDescription, accentColor,
        vendor, productType, tags, status, compareAtPrice,
        costPerItem, sku, barcode, trackQuantity, continueSellingWhenOutOfStock, weight, weightUnit,
        hasVariants, options, variants,
        offers
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.price = price !== undefined ? price : product.price; // handle 0
        product.description = description || product.description;
        product.image = image || product.image;
        product.category = category || product.category;
        product.active = active !== undefined ? active : product.active;
        product.stock = stock !== undefined ? stock : product.stock;
        product.orderIndex = orderIndex !== undefined ? orderIndex : product.orderIndex;

        // New fields (can be empty arrays/strings so we check strictly if passed or overwrite if intended)
        if (gallery !== undefined) product.gallery = gallery;
        if (features !== undefined) product.features = features;
        if (longDescription !== undefined) product.longDescription = longDescription;
        if (accentColor !== undefined) product.accentColor = accentColor;

        // Phase 1, 2, 3 Updates
        if (vendor !== undefined) product.vendor = vendor;
        if (productType !== undefined) product.productType = productType;
        if (tags !== undefined) product.tags = tags;
        if (status !== undefined) product.status = status;

        if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
        if (costPerItem !== undefined) product.costPerItem = costPerItem;
        if (sku !== undefined) product.sku = sku;
        if (barcode !== undefined) product.barcode = barcode;
        if (trackQuantity !== undefined) product.trackQuantity = trackQuantity;
        if (continueSellingWhenOutOfStock !== undefined) product.continueSellingWhenOutOfStock = continueSellingWhenOutOfStock;
        if (weight !== undefined) product.weight = weight;
        if (weightUnit !== undefined) product.weightUnit = weightUnit;

        if (hasVariants !== undefined) product.hasVariants = hasVariants;
        if (options !== undefined) product.options = options;
        if (variants !== undefined) product.variants = variants;
        if (offers !== undefined) product.offers = offers;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
}));

// @desc    Reorder products
// @route   PUT /api/products/reorder
// @access  Private/Admin
router.put('/reorder/all', protect, asyncHandler(async (req, res) => {
    // Expects [{_id, orderIndex}, ...]
    const { products } = req.body; // Array of objects
    if (products && products.length > 0) {
        for (const item of products) {
            await Product.findByIdAndUpdate(item._id, { orderIndex: item.orderIndex });
        }
    }
    res.json({ message: 'Products reordered' });
}));

module.exports = router;
