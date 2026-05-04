const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPasswordSendOtp,
  resetPassword
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// OTP-based registration flow
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Forgot password flow
router.post("/forgot-password-otp", forgotPasswordSendOtp);
router.post("/reset-password", resetPassword);

// Legacy register (still functional)
router.post("/register", registerUser);

router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

module.exports = router;