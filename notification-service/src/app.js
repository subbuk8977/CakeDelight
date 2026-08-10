require("express-async-errors");
const express = require("express");
const cors = require("cors");

const notificationRoutes = require("./routes/notificationRoutes");
const requestLogger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "notification-service" });
});

app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);  

module.exports = app;