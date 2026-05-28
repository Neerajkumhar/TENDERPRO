const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const multer = require('multer');

router.post('/', (req, res) => {
  console.log('Upload request received');
  
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('Multer Upload Error:', err);
      return res.status(500).json({ 
        message: 'File upload error', 
        error: err.message 
      });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('Unknown Upload Error:', err);
      return res.status(500).json({ 
        message: 'Server error during upload', 
        error: err.message 
      });
    }

    if (!req.file) {
      console.error('Upload Error: No file received in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File successfully uploaded:', req.file.filename);
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fullUrl });
  });
});

module.exports = router;
