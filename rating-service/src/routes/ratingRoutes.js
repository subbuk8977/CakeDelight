const express = require("express");
const router = express.Router();
const {
  submitRating,
  getRatingsForCake,
  getAverageRating,
} = require("../controllers/ratingController");

router.post("/", submitRating);
router.get("/:cakeId/average", getAverageRating);
router.get("/:cakeId", getRatingsForCake);

module.exports = router;
