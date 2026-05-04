require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const makeAdmin = async () => {
  try {
    const email = process.argv[2];

    if (!email) {
      console.log("❌ Please provide an email address.");
      console.log("Usage: node makeAdmin.js <user-email>");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`✅ Success! User ${email} is now an admin.`);
    console.log(`They can now log in and will be redirected to the admin dashboard.`);
    process.exit(0);

  } catch (err) {
    console.error("❌ Error setting admin:", err.message);
    process.exit(1);
  }
};

makeAdmin();
