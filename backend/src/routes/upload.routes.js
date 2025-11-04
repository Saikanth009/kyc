const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth.middleware');
const User = require('../models/User');

// Simple disk storage for demo; can be swapped for GridFS or S3
// Keep in sync with static serving path in server.js
const uploadDir = path.join(__dirname, '../../', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});

const upload = multer({ storage });

router.post(
  '/upload',
  auth(),
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
  ]),
  async (req, res) => {
    const files = req.files || {};
    const updates = {};
    
    console.log('Upload request received:', { files: Object.keys(files), userId: req.user.id });
    
    // Handle file uploads
    if (files.aadhaar?.[0]?.filename) {
      updates['documents.aadhaar'] = files.aadhaar[0].filename;
      console.log('Added aadhaar file:', files.aadhaar[0].filename);
    }
    if (files.pan?.[0]?.filename) {
      updates['documents.pan'] = files.pan[0].filename;
      console.log('Added pan file:', files.pan[0].filename);
    }
    if (files.photo?.[0]?.filename) {
      updates['documents.photo'] = files.photo[0].filename;
      console.log('Added photo file:', files.photo[0].filename);
    }
    if (files.addressProof?.[0]?.filename) {
      updates['documents.addressProof'] = files.addressProof[0].filename;
      console.log('Added addressProof file:', files.addressProof[0].filename);
    }
    
    // Handle deletions (when empty blob is sent)
    if (files.aadhaar?.[0] && files.aadhaar[0].size === 0) {
      updates['documents.aadhaar'] = null;
      console.log('Deleting aadhaar file');
    }
    if (files.pan?.[0] && files.pan[0].size === 0) {
      updates['documents.pan'] = null;
      console.log('Deleting pan file');
    }
    if (files.photo?.[0] && files.photo[0].size === 0) {
      updates['documents.photo'] = null;
      console.log('Deleting photo file');
    }
    if (files.addressProof?.[0] && files.addressProof[0].size === 0) {
      updates['documents.addressProof'] = null;
      console.log('Deleting addressProof file');
    }
    
    console.log('Updates to apply:', updates);
    
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select('-passwordHash');
    
    console.log('Updated user:', user);
    res.json(user);
  }
);

module.exports = router;


