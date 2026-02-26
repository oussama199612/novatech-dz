const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Store = require('../models/Store');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const stores = await Store.find({}).sort({ createdAt: -1 });
    res.json(stores);
}));

// @desc    Get active stores
// @route   GET /api/stores/active
// @access  Public
router.get('/active', asyncHandler(async (req, res) => {
    const stores = await Store.find({ active: true }).sort({ createdAt: -1 });
    res.json(stores);
}));

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const store = await Store.findById(req.params.id);
    if (store) {
        res.json(store);
    } else {
        res.status(404);
        throw new Error('Store not found');
    }
}));

// @desc    Create a store
// @route   POST /api/stores
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const { name, address, city, phone, active } = req.body;

    const store = new Store({
        name,
        address,
        city,
        phone,
        active: active !== undefined ? active : true
    });

    const createdStore = await store.save();
    res.status(201).json(createdStore);
}));

// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const { name, address, city, phone, active } = req.body;

    const store = await Store.findById(req.params.id);

    if (store) {
        store.name = name || store.name;
        store.address = address || store.address;
        store.city = city !== undefined ? city : store.city;
        store.phone = phone !== undefined ? phone : store.phone;
        if (active !== undefined) {
            store.active = active;
        }

        const updatedStore = await store.save();
        res.json(updatedStore);
    } else {
        res.status(404);
        throw new Error('Store not found');
    }
}));

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const store = await Store.findById(req.params.id);

    if (store) {
        await store.remove();
        res.json({ message: 'Store removed' });
    } else {
        res.status(404);
        throw new Error('Store not found');
    }
}));

module.exports = router;
