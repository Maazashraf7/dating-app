const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../model/user');
const upload = require('../middleware/upload');

router.post('/register', upload.array('photos', 5), async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName: rawFullName,
      dob,
      age,
      gender,
      location,
      bio,
      hobbies
    } = req.body;

    // Combine names if needed
    const fullName = rawFullName || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();

    // Validate required fields
    if (!username || !email || !password || !fullName || !dob || !age || !gender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
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

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        image: photoPaths[0] || ''
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error. Try again.' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body; 
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }   
  try {
    const user = await User.findOne({ email }); // use `findOne` instead of `find`
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Try again.' });
  }
});


router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];   
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ message: 'Server error. Try again.' });
  }
});




router.put('/profile', upload.array('photos', 5), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];   
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  } 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const updates = req.body;   
    if (req.files && req.files.length > 0) {  
      updates.photos = req.files.map(file => file.path);
    } else {
      updates.photos = [];
    }
    await User.findByIdAndUpdate(userId, updates, { new: true });
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error. Try again.' });
  }
});

module.exports = router;
