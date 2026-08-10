const express = require("express");
const router = express.Router();
const {
  getAllCakes,
  getCakes,
  getCakeById,
  createCake,
  updateCake,
  deleteCake,
} = require("../controllers/cakeController");

router.get("/", getCakes);
router.get("/all", getAllCakes);
router.get("/:id", getCakeById);
router.post("/", createCake);
router.put("/:id", updateCake);
router.delete("/:id", deleteCake);

module.exports = router;
