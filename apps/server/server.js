import 'dotenv/config';
import cluster from 'node:cluster';
import os from 'node:os';
import app from './app.js';
import connectDB from './src/shared/config/db.js';

const PORT = process.env.PORT || 8000;
// Clustering enabled by default unless explicitly set to false or in test mode
const isClusterEnabled = process.env.ENABLE_CLUSTER !== 'false' && process.env.NODE_ENV !== 'test';
// Default to available parallelism or max 4 worker threads for balanced resource usage
const numWorkers = Number(process.env.WORKERS || process.env.WEB_CONCURRENCY) || Math.min(os.availableParallelism?.() || os.cpus().length, 4);

if (isClusterEnabled && cluster.isPrimary) {
  console.log(`\n=================================================`);
  console.log(`🚀 [Cluster Master] PID ${process.pid} initializing.`);
  console.log(`⚡ [Cluster Master] Spawning ${numWorkers} worker threads across CPU cores...`);
  console.log(`=================================================\n`);

  // Spawn worker threads
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  // Worker lifecycle handlers
  cluster.on('online', (worker) => {
    console.log(`  └─ [Worker Thread PID ${worker.process.pid}] Online and accepting HTTP traffic.`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ [Worker Thread PID ${worker.process.pid}] terminated (code: ${code}, signal: ${signal}). Spawning replacement...`);
    cluster.fork();
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n🛑 [Cluster Master] Received termination signal. Gracefully stopping workers...');
    for (const id in cluster.workers) {
      cluster.workers[id]?.process.kill('SIGTERM');
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

} else {
  // Worker processes boot Express server and establish DB connection
  connectDB().then(() => {
    app.listen(PORT, () => {
      const mode = isClusterEnabled ? `Worker PID ${process.pid}` : `Single PID ${process.pid}`;
      console.log(`[HTTP Server] Listening on http://localhost:${PORT} (${mode}, env: ${process.env.NODE_ENV || 'development'})`);
    });
  }).catch((err) => {
    console.error(`[Worker PID ${process.pid}] Database connection failure:`, err.message);
    process.exit(1);
  });
}