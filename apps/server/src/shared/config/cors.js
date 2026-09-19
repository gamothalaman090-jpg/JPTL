const parseOrigins = () => {
  const defaults = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  if (!process.env.CLIENT_URL) {
    return defaults;
  }

  const envOrigins = process.env.CLIENT_URL
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter((url) => url && url !== '*'); // Disallow wildcard with credentials: true

  // In non-production environments, preserve localhost access
  if (process.env.NODE_ENV !== 'production') {
    return Array.from(new Set([...defaults, ...envOrigins]));
  }

  return envOrigins.length > 0 ? envOrigins : defaults;
};

const allowedOrigins = parseOrigins();

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile native apps, curl, server-to-server, Postman)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Disallow origin cleanly without unhandled server exception
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400, // 24 hours preflight cache
};