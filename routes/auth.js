// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // Assuming you have a middleware for handling file uploads
const multer = require('multer');
const path = require('path');
const userController = require('../controller/usersController');

// Routes
router.post('/register', upload.array('photos', 5), userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUserProfile);
router.put('/profile', upload.array('photos', 5), userController.updateUserProfile);

module.exports = router;
