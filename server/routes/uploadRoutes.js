const express = require('express');
const Image = require('../models/Image');
const router = express.Router();

router.post('/', express.json({ limit: '50mb' }), async (req, res) => {
    try {
        const { image } = req.body; // Expecting a base64 string

        if (!image) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        // Basic validation for base64
        if (!image.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid image format. Expected base64 data URI.' });
        }

        // Extract content type and base64 data
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid base64 encoding.' });
        }

        const contentType = matches[1];
        const dataBuffer = Buffer.from(matches[2], 'base64');

        // Save image to MongoDB
        const newImage = new Image({
            filename: `upload_${Date.now()}`, // Generic name since we don't have the original filename
            contentType,
            data: dataBuffer
        });

        const savedImage = await newImage.save();

        // Return the API URL to access this image
        res.send(`/api/images/${savedImage._id}`);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: `Upload Error: ${error.message}` });
    }
});

module.exports = router;
