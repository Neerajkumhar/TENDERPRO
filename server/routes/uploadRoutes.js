const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/', (req, res) => {
  console.log('Upload request received');
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('S3 Upload Error:', err);
      return res.status(500).json({ 
        message: 'Error uploading to S3', 
        error: err.message 
      });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fullUrl });
  });
});

module.exports = router;
