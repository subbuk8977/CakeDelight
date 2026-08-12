require("dotenv").config();
require('express-async-errors');
const app = require("./app");
const connectDB = require("./config/dbConnect");

const express = require('express');
const PORT = process.env.PORT || 4001;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`catalog-service listening on port ${PORT}`);
});