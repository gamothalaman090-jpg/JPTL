/**
 * Recursively sanitizes objects in-place to prevent MongoDB operator injection ($gt, $ne, etc.)
 * Safely removes keys starting with '$' or containing '.' without reassigning read-only Express getters (like req.query/req.params in Express 5).
 */
function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== 'object') return;

  // Preserve non-plain objects like Date, Buffer, etc.
  if (obj instanceof Date || Buffer.isBuffer(obj)) {
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeInPlace(obj[i]);
      }
    }
    return;
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeInPlace(obj[key]);
    }
  }
}

export const sanitizeMiddleware = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      sanitizeInPlace(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      sanitizeInPlace(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      sanitizeInPlace(req.params);
    }
    next();
  } catch (err) {
    next(err);
  }
};
