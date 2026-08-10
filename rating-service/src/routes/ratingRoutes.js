const express = require("express");
const router = express.Router();
const {
  submitRating,
  getRatingsForCake,
  getAverageRating,
  getRating,
} = require("../controllers/ratingController");

router.post("/submit", submitRating);
router.get("/", getRating);
router.get("/:cakeId/average", getAverageRating);
router.get("/:cakeId", getRatingsForCake);

module.exports = router;
