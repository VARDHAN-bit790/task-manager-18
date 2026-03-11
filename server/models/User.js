const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },

  // ✅ Admin flag — set manually in DB or via seed script
  isAdmin: {
    type: Boolean,
    default: false,
  },

  // ✅ Ban flag — admin can ban users
  isBanned: {
    type: Boolean,
    default: false,
  },

  // ✅ Track last login time
  lastLoginAt: {
    type: Date,
    default: null,
  },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);