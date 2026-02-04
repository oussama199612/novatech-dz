const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const PaymentMethod = require('../models/PaymentMethod');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get active payment methods
// @route   GET /api/payment-methods
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const methods = await PaymentMethod.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(methods);
}));

// @desc    Get ALL payment methods (Admin)
// @route   GET /api/payment-methods/all
// @access  Private/Admin
router.get('/all', protect, asyncHandler(async (req, res) => {
    const methods = await PaymentMethod.find({}).sort({ displayOrder: 1 });
    res.json(methods);
}));

// @desc    Create payment method
// @route   POST /api/payment-methods
// @access  Private/Admin
router.post('/', protect, asyncHandler(async (req, res) => {
    const method = new PaymentMethod(req.body);
    const createdMethod = await method.save();
    res.status(201).json(createdMethod);
}));

// @desc    Update payment method
// @route   PUT /api/payment-methods/:id
// @access  Private/Admin
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const method = await PaymentMethod.findById(req.params.id);
    if (method) {
        method.name = req.body.name || method.name;
        method.slug = req.body.slug || method.slug;
        method.description = req.body.description || method.description;
        method.accountLabel = req.body.accountLabel || method.accountLabel;
        method.accountValue = req.body.accountValue || method.accountValue;
        method.extraInfo = req.body.extraInfo || method.extraInfo;
        method.isActive = req.body.isActive !== undefined ? req.body.isActive : method.isActive;
        method.displayOrder = req.body.displayOrder !== undefined ? req.body.displayOrder : method.displayOrder;

        const updatedMethod = await method.save();
        res.json(updatedMethod);
    } else {
        res.status(404);
        throw new Error('Payment method not found');
    }
}));

// @desc    Delete payment method
// @route   DELETE /api/payment-methods/:id
// @access  Private/Admin
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const method = await PaymentMethod.findById(req.params.id);
    if (method) {
        await method.deleteOne();
        res.json({ message: 'Method removed' });
    } else {
        res.status(404);
        throw new Error('Method not found');
    }
}));

module.exports = router;
