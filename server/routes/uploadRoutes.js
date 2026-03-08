const path = require('path');
const express = require('express');
const multer = require('multer');
const Image = require('../models/Image');
const router = express.Router();

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif|bmp|tiff/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname || mimetype) {
        return cb(null, true);
    } else {
        cb(new Error(`Images only! (Received: ${file.mimetype})`));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Save image to MongoDB
        const newImage = new Image({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer
        });

        const savedImage = await newImage.save();

        // Return the API URL to access this image
        res.send(`/api/images/${savedImage._id}`);
    } catch (error) {
        res.status(500).json({ message: `Upload Error: ${error.message}` });
    }
});

module.exports = router;
