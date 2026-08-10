const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/rating_db";
  try {
    await mongoose.connect(uri);
    console.log(`[rating-service] MongoDB connected: ${uri}`);
  } catch (err) {
    console.error("[rating-service] MongoDB connection error:", err.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
