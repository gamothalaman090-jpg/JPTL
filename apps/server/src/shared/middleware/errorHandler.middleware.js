/**
 * 404 Not Found Middleware for handling unmatched routes.
 */
export const notFoundMiddleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl || req.url} not found`,
  });
};

/**
 * Global Centralized Error Handler Middleware.
 * Standardizes errors into { success: false, message: ... }.
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    message = messages.join(', ') || 'Validation error';
  }

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource ID: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token signature';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  // Log server errors (500+) unless running in automated test mode
  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error(`[ERROR] [${req.id || '-'}] ${req.method} ${req.originalUrl}:`, err);
  }

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
