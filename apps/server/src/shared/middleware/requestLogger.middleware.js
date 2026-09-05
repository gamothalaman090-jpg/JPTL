/**
 * Structured request logger & execution timer.
 * Tracks incoming HTTP requests, response status, and latency.
 * Automatically silenced in test mode (NODE_ENV === 'test').
 */
export const requestLoggerMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
    const status = res.statusCode;
    const reqId = req.id || '-';
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `[${new Date().toISOString()}] [${reqId}] ${req.method} ${req.originalUrl || req.url} ${color}${status}${reset} - ${elapsedTimeMs} ms`
    );
  });

  next();
};
