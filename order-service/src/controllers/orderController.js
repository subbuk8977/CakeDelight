const Basket = require("../models/Basket");
const Order = require("../models/Order");
const { publishOrderCompleted } = require("../events/orderEventPublisher");

// POST /api/orders/checkout  { userId }
const checkout = async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    const basket = await Basket.findOne({ userId });

    if (!basket || basket.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Basket is empty",
      });
    }

    const totalAmount = basket.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      userId,
      email,
      items: basket.items,
      totalAmount,
      status: "CONFIRMED",
    });

    // Clear basket after successful checkout
    basket.items = [];
    await basket.save();

    // Publish event to RabbitMQ
    const published = await publishOrderCompleted(order);

    if (!published) {
      console.warn(
        `[order-service] Order ${order._id} created but event was not published`
      );
    }

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("[order-service] Checkout failed:", error);

    return res.status(500).json({
      success: false,
      message: "Checkout failed",
      error: error.message,
    });
  }
};

// GET /api/orders/:userId  -> order history for a user
const getOrdersByUser = async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: orders.length, data: orders });
};

// GET /api/orders/detail/:orderId  -> track a single order
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  res.status(200).json({ success: true, data: order });
};

// GET /api/orders/check-purchase/:userId/:cakeId
const checkPurchase = async (req, res) => {
  const { userId, cakeId } = req.params;

  const order = await Order.findOne({
    userId,
    status: "CONFIRMED",
    "items.cakeId": cakeId,
  });

  res.status(200).json({
    success: true,
    purchased: !!order,
  });
};

module.exports = { 
    checkout, 
    getOrdersByUser, 
    getOrderById,
    checkPurchase,
};