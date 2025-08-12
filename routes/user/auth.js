const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload'); // your multer middleware
const { register, loginUser, getUserProfile, updateUserProfile,	getUserCountAndStatus } = require('../../controller/usersController');
const { auth } = require('../../middleware/auth');

// Routes

// Allow uploading multiple photos (max 5) during registration
router.post('/register', upload.array('photos', 5), register);

// Login route
router.post('/login', loginUser);

// Protected routes for profile
router.get('/profile', auth, getUserProfile);

// Allow multiple photo upload on profile update as well
router.put('/profile', auth, upload.array('photos', 5), updateUserProfile);

// Get user count and online status
router.get('/user-count', auth, getUserCountAndStatus);

module.exports = router;
