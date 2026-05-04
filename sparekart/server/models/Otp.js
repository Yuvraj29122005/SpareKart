const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  // Store registration data temporarily so we can create the user after verification (optional for forgot password)
  name: { type: String },
  password: { type: String },
  phone: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 minutes
});

// Compound index for fast OTP lookups
otpSchema.index({ email: 1, otp: 1 });

module.exports = mongoose.model("Otp", otpSchema);
