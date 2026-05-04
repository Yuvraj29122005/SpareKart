const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../config/mailer");

const buildToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/** Generate a random 6‑digit OTP */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ─────────── STEP 1: Send OTP ─────────── */
exports.sendOtp = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // Hash password before storing in OTP record
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Delete any previous OTP for this email
    await Otp.deleteMany({ email });

    // Create new OTP
    const otp = generateOtp();
    await Otp.create({ email, otp, name, password: hashed, phone: phone || "" });

    // Send email asynchronously to avoid blocking
    sendOtpEmail(email, otp).catch(err => console.error("OTP send error:", err));

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("sendOtp error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─────────── STEP 2: Verify OTP & Register ─────────── */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required" });
    }

    // Find matching OTP record (auto‑expired records won't exist)
    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Double-check user doesn't already exist (race condition guard)
    const exists = await User.findOne({ email });
    if (exists) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ message: "User already exists" });
    }

    // Create the user from stored registration data
    const user = await User.create({
      name: record.name,
      email: record.email,
      password: record.password, // already hashed
      phone: record.phone
    });

    // Clean up OTP records
    await Otp.deleteMany({ email });

    res.status(201).json({
      message: "Email verified & account created",
      token: buildToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─────────── STEP 3: Resend OTP ─────────── */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "email is required" });

    // Find existing pending registration
    const existing = await Otp.findOne({ email });
    if (!existing) {
      return res.status(400).json({ message: "No pending registration found. Please register again." });
    }

    // Delete old records, create new OTP but keep registration data
    const otp = generateOtp();
    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otp,
      name: existing.name,
      password: existing.password,
      phone: existing.phone
    });

    // Send email asynchronously
    sendOtpEmail(email, otp).catch(err => console.error("OTP send error:", err));
    res.json({ message: "OTP resent to your email" });
  } catch (err) {
    console.error("resendOtp error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─────────── Legacy Register (kept for reference, no longer used by frontend) ─────────── */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed, phone: phone || "" });
    res.status(201).json({
      message: "User created",
      token: buildToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "Blocked" || user.status === "Inactive") {
      return res.status(403).json({ message: "Your account has been suspended by the administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      token: buildToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body || {};
    
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────── Forgot Password Flow ─────────── */
exports.forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await Otp.deleteMany({ email });
    const otp = generateOtp();
    await Otp.create({ email, otp });

    // Send email asynchronously
    sendOtpEmail(email, otp).catch(err => console.error("OTP send error:", err));

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("forgotPasswordSendOtp error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "email, otp, and newPassword are required" });
    }

    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    await user.save();

    await Otp.deleteMany({ email });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: err.message });
  }
};