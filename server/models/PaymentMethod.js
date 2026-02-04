const mongoose = require('mongoose');

const paymentMethodSchema = mongoose.Schema({
    name: { type: String, required: true }, // e.g., "CCP"
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    accountLabel: { type: String, required: true }, // e.g., "Rip"
    accountValue: { type: String, required: true }, // e.g., "123456789"
    extraInfo: { type: String }, // e.g., "Envoyer la preuve ici"

    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
}, {
    timestamps: true
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

module.exports = PaymentMethod;
