// controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/users/User');

// ==========================
// Register User
// ==========================
exports.register = async (req, res) => {
  try {
    const {
      phoneNo,
      email,
      password,
      firstName,
      lastName,
      dob,
      age,
      gender,
      street,
      city,
      state,
      country,
      postalCode,
      bio,
      hobbies,
      status
    } = req.body;

    const profileImage = req.file?.filename || '';

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Location object
    const location = {
      street: street?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      country: country?.trim() || '',
      postalCode: postalCode?.trim() || ''
    };

    // Convert hobbies string to array
    const hobbiesArray = Array.isArray(hobbies)
      ? hobbies.map(h => h.trim())
      : hobbies
        ? hobbies.split(',').map(h => h.trim())
        : [];

    // Uploaded images
    const files = req.files || [];
    const photoPaths = files.map(file => file.filename);

    // Create new user according to schema
    const newUser = new User({
      Name: {
        firstName: firstName?.trim() || '',
        lastName: lastName?.trim() || ''
      },
      phoneNo: phoneNo?.trim() || '',
      email: email?.trim().toLowerCase(),
      password: passwordHash,
      dob,
      age,
      gender,
      location: {
        street: street?.trim() || '',
        city: city?.trim() || '',
        state: state?.trim() || '',
        country: country?.trim() || '',
        postalCode: postalCode?.trim() || ''
      },
      bio,
      hobbies: hobbiesArray,
      profilePic: photoPaths[0] || '',
      photos: photoPaths,
      status: status || 'Active'
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


// ==========================
// Login User
// ==========================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // 2️⃣ Check if user exists
    const user = await User.findOne({ email }).select('+password'); // Ensure password is included
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5️⃣ Log useful info for debugging
    console.log(`✅ Login successful for: ${user.fullName}`);
    console.log(`🔑 JWT Token generated`);
    console.log(`🖼 Profile Pic: ${user.profilePic}`);

    // 6️⃣ Remove password before sending response
    const { password: _, ...userWithoutPassword } = user.toObject();

    // 7️⃣ Send success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};


// ==========================
// Get Logged-in User Profile
// ==========================
exports.getUserProfile = async (req, res) => {
  try {
    const userId =
      req.user?.id || req.user?._id || req.body.id || req.query.id || req.params.id;

    if (!userId) {
      console.warn("❌ No user ID found");
      return res.status(401).json({ message: "Unauthorized: No user ID" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.warn("❌ User not found for ID", userId);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("❌ getUserProfile error", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================
// Update User Profile
// ==========================
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.id || req.query.id;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const {
      fullName,
      dob,
      age,
      gender,
      street,
      city,
      state,
      country,
      postalCode,
      bio,
      hobbies,
      status
    } = req.body;

    const updatedData = {
      ...(fullName && { fullName }),
      ...(dob && { dob }),
      ...(age && { age }),
      ...(gender && { gender }),
      ...(street || city || state || country || postalCode
        ? {
          location: {
            street: street?.trim() || '',
            city: city?.trim() || '',
            state: state?.trim() || '',
            country: country?.trim() || '',
            postalCode: postalCode?.trim() || ''
          }
        }
        : {}),
      ...(bio && { bio }),
      ...(status && { status }),
      ...(hobbies
        ? { hobbies: Array.isArray(hobbies) ? hobbies : hobbies.split(',').map(h => h.trim()) }
        : {}),
      updatedAt: Date.now(),
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    ).select('-password -__v');

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};
// ==========================
// get user count and online status
// ==========================
exports.getUserCountAndStatus = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const activeUsers = await User.countDocuments({ status: 'Active' });

    res.status(200).json({
      success: true,
      message: "User count and online status fetched successfully",
      data: {
        userCount,
        onlineUsers,
        activeUsers,
      }
    });
  } catch (error) {
    console.error("❌ getUserCountAndStatus error", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};