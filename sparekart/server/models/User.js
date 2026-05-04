const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "User", "Admin"], default: "user" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive", "Blocked"], default: "Active" }
  },
  { timestamps: true }
);

// Index on email for fast login lookups
userSchema.index({ email: 1 });
// Index on role for admin panel user listing
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);