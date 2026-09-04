import crypto from 'node:crypto';

/**
 * Assigns a unique Request ID (UUID v4) to each incoming request.
 * Sets the 'X-Request-ID' header on both the request and response objects for tracing.
 */
export const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  const reqId = typeof incomingId === 'string' && incomingId.trim() ? incomingId.trim() : crypto.randomUUID();

  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
};
