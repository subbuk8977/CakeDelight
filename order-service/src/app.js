const express = require("express");
const cors = require("cors");
const app = express();

const basketRoutes = require("./routes/basketRoutes");
const orderRoutes = require('./routes/orderRoutes');
const requestLogger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "order-service" });
});

app.use("/api/basket", basketRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;