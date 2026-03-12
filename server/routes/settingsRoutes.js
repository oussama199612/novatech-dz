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

        if (req.body.termsOfService !== undefined) settings.termsOfService = req.body.termsOfService;
        if (req.body.privacyPolicy !== undefined) settings.privacyPolicy = req.body.privacyPolicy;
        if (req.body.contactInfo !== undefined) settings.contactInfo = req.body.contactInfo;
        if (req.body.aboutUs !== undefined) settings.aboutUs = req.body.aboutUs;

        if (req.body.brands !== undefined) settings.brands = req.body.brands;
        if (req.body.gtmId !== undefined) settings.gtmId = req.body.gtmId;

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

// @desc    Validate GTM ID existence by pinging Google servers
// @route   POST /api/settings/validate-gtm
// @access  Private/Admin
router.post('/validate-gtm', protect, asyncHandler(async (req, res) => {
    const { gtmId } = req.body;
    if (!gtmId) {
        return res.status(400).json({ valid: false, message: 'ID missing' });
    }

    const trimmed = gtmId.trim().toUpperCase();

    // GA4 (G-) tags always return HTTP 200 from Google even if fake. We can only regex validate them.
    if (trimmed.startsWith('G-')) {
        const isFormatValid = /^G-[A-Z0-9]{4,}$/.test(trimmed);
        return res.json({ valid: isFormatValid, type: 'GA4', message: isFormatValid ? 'Format GA4 OK' : 'Format GA4 Invalide' });
    }

    // GTM (GTM-) tags return 404 if they don't exist. We can truly validate them.
    if (trimmed.startsWith('GTM-')) {
        const isFormatValid = /^GTM-[A-Z0-9]{4,}$/.test(trimmed);
        if (!isFormatValid) return res.json({ valid: false, type: 'GTM', message: 'Format GTM Invalide' });

        try {
            // Native Node.js fetch (available in Node 18+)
            const response = await fetch(`https://www.googletagmanager.com/gtm.js?id=${trimmed}`);
            if (response.status === 200) {
                return res.json({ valid: true, type: 'GTM', message: 'Containeur GTM trouvé en ligne' });
            } else {
                return res.json({ valid: false, type: 'GTM', message: `Containeur GTM introuvable (Status ${response.status})` });
            }
        } catch (error) {
            console.error('GTM Validation Error:', error);
            return res.status(500).json({ valid: false, message: 'Erreur réseau lors de la vérification' });
        }
    }

    res.json({ valid: false, message: 'Format non reconnu' });
}));

module.exports = router;
