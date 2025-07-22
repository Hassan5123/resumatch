// Centralized error handling middleware
// Usage: import { notFound, errorHandler } from './middleware/errorHandler';
// then after all routes, add: app.use(notFound); app.use(errorHandler);

// 404 handler – catches requests to unknown routes
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Generic error handler – formats all errors in a consistent JSON structure
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Hide stack trace in production
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

module.exports = { notFound, errorHandler };
