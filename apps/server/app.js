import express from 'express';
import cors from 'cors';
import { corsOptions } from './src/shared/config/cors.js';

const app = express();

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

export default app;