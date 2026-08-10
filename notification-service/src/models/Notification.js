const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    channel: { type: String, enum: ["EMAIL", "SMS", "IN_APP"], default: "EMAIL" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      default: "SENT",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
