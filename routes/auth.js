const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const upload = require('../middleware/upload');


router.post('/register', upload.array('photos', 5), async (req, res) => {
  try {
    const {
      username, email, password,
      fullName, dob, age, gender,
      location, bio, hobbies
    } = req.body;

    // Check required fields
    if (!username || !email || !password || !fullName || !dob || !age || !gender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Handle uploaded photo paths
    const photoPaths = req.files?.map(file => file.path) || [];

    const newUser = new User({
      username,
      email,
      passwordHash,
      fullName,
      dob,
      age,
      gender,
      location,
      bio,
      hobbies,
      photos: photoPaths
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error. Try again.' });
  }
});

module.exports = router;
