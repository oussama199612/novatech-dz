const express = require('express');
const router = express.Router();
const Image = require('../models/Image');

// @route   GET /api/images/:id
// @desc    Get an image by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).send('Image not found');
        }

        res.set('Content-Type', image.contentType);
        // Add cache control to prevent re-downloading
        res.set('Cache-Control', 'public, max-age=31557600');
        res.send(image.data);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
