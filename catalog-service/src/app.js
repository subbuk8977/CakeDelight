const express = require("express");
const cors = require("cors");
const app = express();
const requestLogger = require("./middlewares/logger");
const {notFound,errorHandler} = require("./middlewares/errorHandler");
const cakeRoutes = require("./routes/cakeRoutes");

app.use(cors());
app.use(express.json());

app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "catalog-service" });
});

app.use("/api/catalog/cakes", cakeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;