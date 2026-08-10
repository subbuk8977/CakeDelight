const express = require('express');
const cors = require("cors");

const ratingRoutes = require("./routes/ratingRoutes");
const requestLogger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "rating-service" });
});

app.use("/api/ratings", ratingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;


