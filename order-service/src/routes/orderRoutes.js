const express = require("express");
const router = express.Router();
const { checkout, getOrdersByUser, getOrderById, checkPurchase } = require("../controllers/orderController");

router.post("/checkout", checkout);
router.get("/detail/:orderId", getOrderById);
router.get("/:userId", getOrdersByUser);
router.get("/check-purchase/:userId/:cakeId",checkPurchase);

module.exports = router;
