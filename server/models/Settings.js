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
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
