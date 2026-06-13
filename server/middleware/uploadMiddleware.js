const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.warn('Could not create uploads directory:', err.message);
  }
}

let storage;

const useS3 = !!(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
);

if (useS3) {
  console.log('Configuring Multer to upload to S3 bucket:', process.env.AWS_S3_BUCKET);
  const s3 = new S3Client({
    region: process.env.AWS_S3_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now().toString()}-${safeName}`;
      cb(null, fileName);
    }
  });
} else {
  console.log('Configuring Multer to use local disk storage');
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now().toString()}-${safeName}`;
      cb(null, fileName);
    }
  });
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB to match frontend claims
});

module.exports = upload;
