const mongoose = require('mongoose');

const storeSchema = mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    phone: { type: String },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
