import compression from 'compression';

/**
 * Compresses HTTP responses using Gzip / Brotli.
 * Skips compression if 'x-no-compression' header is present or payload < 1KB.
 */
export const compressionMiddleware = compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
});
