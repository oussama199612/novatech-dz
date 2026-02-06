const path = require('path');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif|bmp|tiff/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname || mimetype) {
        return cb(null, true);
    } else {
        cb(`Images only! (Received: ${file.mimetype})`);
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            return res.status(500).json({ message: `Multer Error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(500).json({ message: `Upload Error: ${err}` });
        }

        // Everything went fine.
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.send(`/${req.file.path.replace(/\\/g, '/')}`);
    });
});

module.exports = router;
