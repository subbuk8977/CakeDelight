require("dotenv").config();
require('express-async-errors');
const app = require("./app");
const connectDB = require("./config/dbConnect");

const express = require('express');
const PORT = process.env.PORT || 4001;

const server = app.listen(PORT, () => {
  console.log(`catalog-service listening on port ${PORT}`);
  connectDB();
});

process.on("SIGTERM", () => {
  console.log("[catalog-service] SIGTERM received, shutting down");

  server.close(() => {
    console.log("[catalog-service] HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[catalog-service] SIGINT received, shutting down");

  server.close(() => {
    console.log("[catalog-service] HTTP server closed");
    process.exit(0);
  });
});