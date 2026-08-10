const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

const errorHandler = (err, req, res, next) => {
  console.error("[order-service] Error:", err.message);
  // Handle downstream (Catalog service) failures distinctly for clearer diagnostics
  if (err.isAxiosError) {
    const status = err.response ? err.response.status : 502;
    return res.status(status).json({
      success: false,
      message: `Upstream catalog-service error: ${err.message}`,
    });
  }
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = { notFound, errorHandler };
