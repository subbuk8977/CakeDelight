const requestLogger = (req, res, next) => {
  // Don't log Kubernetes health checks
  if (req.path === "/health" || req.path === "/healthz") {
    return next();
  }

  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;

    console.log(
      `[catalog-service] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
    );
  });

  next();
};

module.exports = requestLogger;