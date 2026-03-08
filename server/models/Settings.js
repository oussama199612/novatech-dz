const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    shopName: { type: String, default: 'Novatech' },
    logoUrl: { type: String },
    currency: { type: String, default: 'DZD' },
    exchangeRate: { type: Number, default: 1 }, // e.g. 1 USD = X DZD if needed, or just display info

    instagramUrl: { type: String },
    whatsappUrl: { type: String },
    telegramUrl: { type: String },

    contactEmail: { type: String },
    contactPhone: { type: String },

    // Informational Pages (HTML Content)
    termsOfService: { type: String, default: '' },
    privacyPolicy: { type: String, default: '' },
    contactInfo: { type: String, default: '' }, // Can be used for a rich text contact page
    aboutUs: { type: String, default: '' },

    brands: [{
        name: { type: String, required: true },
        logoUrl: { type: String, required: true }
    }],

    enableMultiStore: { type: Boolean, default: false }, // Toggle for multi-store logic
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
