const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    cakeId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

ratingSchema.index({ cakeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
