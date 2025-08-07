// controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/user');

// Register User
exports.registerUser = async (req, res) => {
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

    const fullName = rawFullName || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();

    if (!username || !email || !password || !fullName || !dob || !age || !gender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

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
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("✅ Login successful, sending user:", user.fullName);

    res.json({
      success: true,
      token,
      message: 'Login successful',
      userId: user._id,
      user: {
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again later.' });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
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
};

// Update Profile
exports.updateProfile = async (req, res) => {
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
};
