const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) {
        // Return default settings if none exist
        settings = {
            shopName: 'Novatech',
            currency: 'DZD',
            exchangeRate: 1,
            enableMultiStore: false
        }
    }
    res.json(settings);
}));

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, asyncHandler(async (req, res) => {
    const settings = await Settings.findOne();

    if (settings) {
        settings.shopName = req.body.shopName || settings.shopName;
        settings.logoUrl = req.body.logoUrl || settings.logoUrl;
        settings.currency = req.body.currency || settings.currency;
        settings.exchangeRate = req.body.exchangeRate || settings.exchangeRate;
        settings.instagramUrl = req.body.instagramUrl || settings.instagramUrl;
        settings.whatsappUrl = req.body.whatsappUrl || settings.whatsappUrl;
        settings.telegramUrl = req.body.telegramUrl || settings.telegramUrl;
        settings.contactEmail = req.body.contactEmail || settings.contactEmail;
        settings.contactPhone = req.body.contactPhone || settings.contactPhone;

        if (req.body.enableMultiStore !== undefined) {
            settings.enableMultiStore = req.body.enableMultiStore;
        }

        const updatedSettings = await settings.save();
        res.json(updatedSettings);
    } else {
        // Create if doesn't exist
        const newSettings = new Settings(req.body);
        const createdSettings = await newSettings.save();
        res.status(201).json(createdSettings);
    }
}));

module.exports = router;
