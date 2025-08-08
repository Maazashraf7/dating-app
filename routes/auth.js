// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const userController = require('../controller/usersController');

router.post('/register', upload.array('photos', 5), userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, upload.array('photos', 5), userController.updateUserProfile);

module.exports = router;
