import helmet from 'helmet';

/**
 * Security headers via Helmet.
 * Hardens HTTP headers with Content Security Policy, HSTS, noSniff, frameguard, etc.
 */
export const securityHeadersMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'blob:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", 'https://res.cloudinary.com', 'http://localhost:*', 'http://127.0.0.1:*'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});
