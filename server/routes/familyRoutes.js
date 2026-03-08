const express = require('express');
const router = express.Router();
const Family = require('../models/Family');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all families
// @route   GET /api/families
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const families = await Family.find({}).sort({ name: 1 });
    res.json(families);
}));

// @desc    Fetch single family
// @route   GET /api/families/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const family = await Family.findById(req.params.id);

    if (family) {
        res.json(family);
    } else {
        res.status(404);
        throw new Error('Family not found');
    }
}));

// @desc    Create a family
// @route   POST /api/families
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const { name, image, showInHomeBar } = req.body;

    const familyExists = await Family.findOne({ name });

    if (familyExists) {
        res.status(400);
        throw new Error('Family already exists');
    }

    const family = new Family({
        name,
        image,
        showInHomeBar: showInHomeBar || false,
    });

    const createdFamily = await family.save();
    res.status(201).json(createdFamily);
}));

// @desc    Update a family
// @route   PUT /api/families/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    const { name, image, showInHomeBar } = req.body;

    const family = await Family.findById(req.params.id);

    if (family) {
        family.name = name || family.name;
        // Automatically reculcuates slug via pre-save hook
        family.image = image !== undefined ? image : family.image;
        family.showInHomeBar = showInHomeBar !== undefined ? showInHomeBar : family.showInHomeBar;

        const updatedFamily = await family.save();
        res.json(updatedFamily);
    } else {
        res.status(404);
        throw new Error('Family not found');
    }
}));

// @desc    Delete a family
// @route   DELETE /api/families/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const family = await Family.findById(req.params.id);

    if (family) {
        await family.deleteOne();
        res.json({ message: 'Family removed' });
    } else {
        res.status(404);
        throw new Error('Family not found');
    }
}));

module.exports = router;
