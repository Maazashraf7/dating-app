const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const upload = require('../middleware/upload'); // multer middleware
const router = express.Router();

// Register with image upload
router.post('/register', upload.single('image'), async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    password,
    age,
    gender,
    location
  } = req.body;

  const image = req.file ? req.file.filename : '';

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName: `${firstName} ${lastName}`,
      email,
      phone,
      address,
      passwordHash,
      age,
      gender,
      location,
      image
    });

    await newUser.save();

    res.status(201).json({
      message: 'Registered successfully',
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        image: newUser.image
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        image: user.image
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 👇 This line fixes your error
module.exports = router;
