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
const profileImage = req.files ? req.file.filename:  ''; // Get the first uploaded file path
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

    const newUser = new User({
      username,
      email,
      password:passwordHash,
      fullName,
      dob,
      age,
      gender,
      location,
      bio,
      hobbies,
      photos: profileImage
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      data: newUser
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
// @desc   Get logged-in user's profile
// @route  GET /api/user/profile
exports.getUserProfile = async (req, res) => {
  try {
    // Accept userId from query, body, or params for flexibility
    const userId = req.query.id || req.body.id || req.params.id;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const user = await User.findById(userId).select('-passwordHash -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Update logged-in user's profile
// @route  PUT /api/user/profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Use req.user.id if available, else fallback to req.body.id or req.query.id
    const userId = req.user?.id || req.body.id || req.query.id;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const {
      fullName,
      dob,
      age,
      gender,
      location,
      bio,
    } = req.body;

    const updatedData = {
      ...(fullName && { fullName }),
      ...(dob && { dob }),
      ...(age && { age }),
      ...(gender && { gender }),
      ...(location && { location }),
      ...(bio && { bio }),
      updatedAt: Date.now(),
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    ).select('-passwordHash -__v');

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};
