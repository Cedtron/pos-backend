const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the path to the frontend's public/uploads directory
const uploadPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', 'products');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the upload directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;