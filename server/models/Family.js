const mongoose = require('mongoose');

const familySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a family name'],
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: String, // optionnel, pour afficher des miniatures de familles si besoin plus tard
        },
        showInHomeBar: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug before validation if modified
familySchema.pre('validate', function () {
    if (this.isModified('name') && this.name) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

const Family = mongoose.model('Family', familySchema);

module.exports = Family;
