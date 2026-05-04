const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool — keeps connections warm so queries don't wait
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeouts — fail fast instead of hanging
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      // Heartbeat to keep connection alive
      heartbeatFrequencyMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;