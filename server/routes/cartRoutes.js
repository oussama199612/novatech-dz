const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const admin = require('../config/firebase');
const User = require('../models/User');

// Middleware to extract user or guest context without strictly blocking guests
const authOrGuest = asyncHandler(async (req, res, next) => {
    let userId = null;
    let guestId = req.headers['x-guest-id'] || req.cookies?.guestId;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            const userDoc = await User.findOne({
                $or: [{ firebaseUid: decodedToken.uid }, { email: decodedToken.email }]
            });
            if (userDoc) {
                userId = userDoc._id;
            }
        } catch (error) {
            console.error('Firebase Auth Error in Cart:', error.message);
        }
    }

    if (!userId && !guestId) {
        // If neither exists, generate a guest ID for them
        guestId = 'guest_' + Date.now() + Math.random().toString(36).substring(7);
        req.generatedGuestId = guestId; // flag to tell client to save it
    }

    req.cartContext = { userId, guestId };
    next();
});

// Helper: Get active cart
const getActiveCartDocument = async (context) => {
    const { userId, guestId } = context;
    let query = { status: 'active' };

    if (userId) {
        query.user = userId;
    } else {
        query.guestId = guestId;
    }

    let cart = await Cart.findOne(query);
    if (!cart) {
        cart = await Cart.create({
            user: userId || undefined,
            guestId: userId ? undefined : guestId
        });
    }
    return cart;
};

// @desc    Get current active cart
// @route   GET /api/cart
// @access  Public (Guest/User)
router.get('/', authOrGuest, asyncHandler(async (req, res) => {
    const cart = await getActiveCartDocument(req.cartContext);
    const items = await CartItem.find({ cart: cart._id }).populate('product', 'name price image variants offers');

    res.json({
        cartId: cart._id,
        items,
        generatedGuestId: req.generatedGuestId || null
    });
}));

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Public (Guest/User)
router.post('/items', authOrGuest, asyncHandler(async (req, res) => {
    const { productId, variantTitle, quantity } = req.body;
    const cart = await getActiveCartDocument(req.cartContext);

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Determine price at addition
    let priceAtAddition = product.price;
    if (variantTitle && product.hasVariants) {
        const variant = product.variants.find(v => v.title === variantTitle);
        if (variant) {
            priceAtAddition = variant.price;
        }
    }

    // Check if item already exists in cart mapped to this variant
    let cartItem = await CartItem.findOne({
        cart: cart._id,
        product: productId,
        variantId: variantTitle || null
    });

    if (cartItem) {
        cartItem.quantity += Number(quantity);
        cartItem.priceAtAddition = priceAtAddition; // Update to latest price
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            cart: cart._id,
            product: productId,
            variantId: variantTitle || null,
            quantity: Number(quantity),
            priceAtAddition
        });
    }

    const items = await CartItem.find({ cart: cart._id }).populate('product', 'name price image variants offers');
    res.status(201).json({ items, generatedGuestId: req.generatedGuestId || null });
}));

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Public
router.put('/items/:itemId', authOrGuest, asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const cart = await getActiveCartDocument(req.cartContext);

    const cartItem = await CartItem.findOne({ _id: req.params.itemId, cart: cart._id });
    if (!cartItem) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    cartItem.quantity = Number(quantity);
    if (cartItem.quantity <= 0) {
        await cartItem.deleteOne();
    } else {
        await cartItem.save();
    }

    const items = await CartItem.find({ cart: cart._id }).populate('product', 'name price image variants offers');
    res.json({ items });
}));

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Public
router.delete('/items/:itemId', authOrGuest, asyncHandler(async (req, res) => {
    const cart = await getActiveCartDocument(req.cartContext);

    const cartItem = await CartItem.findOne({ _id: req.params.itemId, cart: cart._id });
    if (cartItem) {
        await cartItem.deleteOne();
    }

    const items = await CartItem.find({ cart: cart._id }).populate('product', 'name price image variants offers');
    res.json({ items });
}));

// @desc    Merge guest cart into user cart (after login/register)
// @route   POST /api/cart/merge
// @access  Private (Needs Bearer token)
router.post('/merge', authOrGuest, asyncHandler(async (req, res) => {
    const { guestId } = req.body;
    const userId = req.cartContext.userId;

    if (!userId || !guestId) {
        res.status(400);
        throw new Error('User ID and Guest ID are required for merging');
    }

    // Find the guest cart
    const guestCart = await Cart.findOne({ guestId, status: 'active' });
    if (!guestCart) {
        return res.json({ message: 'No guest cart to merge' });
    }

    // Find user's existing active cart
    const userCart = await getActiveCartDocument({ userId, guestId: null });

    // Move all items from guest cart to user cart
    const guestItems = await CartItem.find({ cart: guestCart._id });

    for (const item of guestItems) {
        // Check if user already has this exact item
        const existingUserItem = await CartItem.findOne({
            cart: userCart._id,
            product: item.product,
            variantId: item.variantId
        });

        if (existingUserItem) {
            existingUserItem.quantity += item.quantity;
            await existingUserItem.save();
            await item.deleteOne(); // remove from guest cart
        } else {
            // Re-assign the item to the user's cart
            item.cart = userCart._id;
            await item.save();
        }
    }

    // Mark guest cart as converted
    guestCart.status = 'converted';
    await guestCart.save();

    res.json({ message: 'Cart merged successfully' });
}));

module.exports = router;
