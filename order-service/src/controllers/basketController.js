const Basket = require("../models/Basket");
const axios = require("axios");
const axiosRetry = require("axios-retry").default || require("axios-retry");

const CATALOG_URL = process.env.CATALOG_SERVICE_URL || "http://localhost:4001";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
// GET /api/basket/:userId
const getBasket = async (req, res) => {
  const basket = await Basket.findOne({ userId: req.params.userId });
  res.status(200).json({ success: true, data: basket || { userId: req.params.userId, items: [] } });
};


// POST /api/basket/:userId/items  { cakeId, quantity }
const addItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cakeId, quantity = 1 } = req.body;

    if (!cakeId) {
      return res.status(400).json({
        success: false,
        message: "cakeId is required"
      });
    }

    let basket = await Basket.findOne({ userId });

    if (!basket) {
      basket = new Basket({
        userId,
        items: []
      });
    }

    const existing = basket.items.find(
      (item) => item.cakeId === cakeId
    );

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      const { data } = await axios.get(
        `${CATALOG_URL}/api/catalog/cakes/${cakeId}`
      );

      const cake = data.data;

      basket.items.push({
        cakeId,
        name: cake.name,
        price: cake.price,
        quantity: Number(quantity)
      });
    }

    await basket.save();

    res.status(200).json({
      success: true,
      data: basket
    });

  } catch (error) {
  console.error("ADD ITEM ERROR:", error);
  console.error("MESSAGE:", error.message);
  console.error("RESPONSE:", error.response?.data);
  console.error("STATUS:", error.response?.status);

  if (error.response?.status === 404) {
    return res.status(404).json({
      success: false,
      message: "Cake not found in catalog"
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message
  });
}
};


// PUT /api/basket/:userId/items/:cakeId  { quantity }
const updateItemQuantity = async (req, res) => {
  const { userId, cakeId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: "quantity must be >= 1" });
  }

  const basket = await Basket.findOne({ userId });
  if (!basket) {
    return res.status(404).json({ success: false, message: "Basket not found" });
  }

  const item = basket.items.find((i) => i.cakeId === cakeId);
  if (!item) {
    return res.status(404).json({ success: false, message: "Item not in basket" });
  }
  item.quantity = quantity;
  await basket.save();
  res.status(200).json({ success: true, data: basket });
};


// DELETE /api/basket/:userId/items/:cakeId
const removeItem = async (req, res) => {
  const { userId, cakeId } = req.params;
  const basket = await Basket.findOne({ userId });
  if (!basket) {
    return res.status(404).json({ success: false, message: "Basket not found" });
  }
  basket.items = basket.items.filter((i) => i.cakeId !== cakeId);
  await basket.save();
  res.status(200).json({ success: true, data: basket });
};

module.exports = { 
    getBasket, 
    addItem, 
    updateItemQuantity, 
    removeItem 
};