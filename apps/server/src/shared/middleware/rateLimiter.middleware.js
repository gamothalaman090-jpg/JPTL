import rateLimit from 'express-rate-limit';

/**
 * Helper to bypass rate limiting in test environment or when explicitly disabled
 */
const shouldSkip = () => {
  return process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true';
};

/**
 * Standard / General API Limiter (applied to all /api routes)
 * 300 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkip,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again in 15 minutes.',
  },
});

/**
 * Strict Auth Limiter (applied to /api/auth/login, /api/auth/signup)
 * Protects against brute-force attacks and credential stuffing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkip,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Strict Action Limiter (applied to payments and document uploads)
 * 60 actions per 15 minutes per IP
 */
export const strictActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkip,
  message: {
    success: false,
    message: 'Action rate limit exceeded. Please wait a moment before trying again.',
  },
});
