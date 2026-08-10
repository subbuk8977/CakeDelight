const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/catalog_db";
  try {
    await mongoose.connect(uri);
    console.log(`[catalog-service] MongoDB connected: ${uri}`);
  } catch (err) {
    console.error("[catalog-service] MongoDB connection error:", err.message);
  }
};

module.exports = connectDB;
