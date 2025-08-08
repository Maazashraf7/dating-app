// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  fullName: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  age: { type: Number, required: true, min: 18 },
  gender: { type: String, enum: ['Male', 'Female', 'Transgender'], required: true },
  location: { type: String, trim: true },
  bio: { type: String, trim: true },
  hobbies: { type: String, trim: true },

  photos: [String] // store image file paths or URLs
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
