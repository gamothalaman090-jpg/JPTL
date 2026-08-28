import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './src/shared/config/cors.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import landlordAnnouncementRoutes from './src/modules/landlord/announcements/announcements.routes.js';
import tenantAnnouncementRoutes from './src/modules/tenant/announcements/announcements.routes.js';

const app = express();

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Announcement routes (Separated by role)
app.use('/api/landlord/announcements', landlordAnnouncementRoutes);
app.use('/api/tenant/announcements', tenantAnnouncementRoutes);

export default app;