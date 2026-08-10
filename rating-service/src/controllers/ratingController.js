const Rating = require("../models/Rating");
const axios = require("axios");
const axiosRetry = require("axios-retry").default || require("axios-retry");

const ORDER_URL = process.env.ORDER_SERVICE_URL || "http://localhost:4002";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

// POST /api/ratings  { cakeId, userId, score, comment }
const submitRating = async (req, res) => {
  const { cakeId, userId, score, comment } = req.body;
  if (!cakeId || !userId || score === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "cakeId, userId and score are required" });
  }
  if (score < 1 || score > 5) {
    return res.status(400).json({ success: false, message: "score must be between 1 and 5" });
  }

  // Check with Order Service whether the user purchased this cake
  const { data } = await axios.get(
    `${ORDER_URL}/api/orders/check-purchase/${userId}/${cakeId}`
  );

  if (!data.purchased) {
    return res.status(403).json({
      success: false,
      message: "You can rate only cakes you have purchased.",
    });
  }

  //allow user to update their existing rating for a cake if not exits it will create new rating
  const rating = await Rating.findOneAndUpdate(
    { cakeId, userId },
    { score, comment },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json({ success: true, data: rating });
};


// GET /api/ratings/:cakeId  -> all ratings for a cake
const getRatingsForCake = async (req, res) => {
  const ratings = await Rating.find({ cakeId: req.params.cakeId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: ratings.length, data: ratings });
};

// GET /api/ratings/:cakeId/average
const getAverageRating = async (req, res) => {
  const result = await Rating.aggregate([
    { $match: { cakeId: req.params.cakeId } },
    { $group: { _id: "$cakeId", average: { $avg: "$score" }, count: { $sum: 1 } } },
  ]);

  if (result.length === 0) {
    return res.status(200).json({ success: true, data: { cakeId: req.params.cakeId, average: 0, count: 0 } });
  }

  res.status(200).json({
    success: true,
    data: { cakeId: req.params.cakeId, average: Number(result[0].average.toFixed(2)), count: result[0].count },
  });
};

module.exports = { 
    submitRating, 
    getRatingsForCake, 
    getAverageRating 
};
