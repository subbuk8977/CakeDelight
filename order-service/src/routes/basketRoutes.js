const express = require("express");
const router = express.Router();
const {
  getBasket,
  addItem,
  updateItemQuantity,
  removeItem,
} = require("../controllers/basketController");

router.get("/:userId", getBasket);
router.post("/:userId/items", addItem);
router.put("/:userId/items/:cakeId", updateItemQuantity);
router.delete("/:userId/items/:cakeId", removeItem);

module.exports = router;
