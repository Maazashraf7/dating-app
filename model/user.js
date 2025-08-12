const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  Name:{
    firstName:{type:String, required:true, trim:true},
    lastName:{type:String, required:true, trim:true}
  },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phoneNo: { type: String, required: true, unique: true, trim: true },  
  // fullName: { type: String, required: true, trim: true },
  dob: { type: String, required: true },
  age: { type: Number, required: true, min: 18 },
  gender: { type: String, enum: ['Male', 'Female', 'Transgender'], required: true },

  location: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true }
  },

  bio: { type: String, trim: true },
  hobbies: [{ type: String, trim: true }], // array of hobbies

  photos: [{ type: String, trim: true }], // store image file paths or URLs

  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Banned'], 
    default: 'Active' 
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
