const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27019/order_db";
  try {
    await mongoose.connect(uri);
    console.log(`[order-service] MongoDB connected: ${uri}`);
  } catch (err) {
    console.error("[order-service] MongoDB connection error:", err.message);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
