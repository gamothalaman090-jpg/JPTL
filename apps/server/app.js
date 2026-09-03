import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './src/shared/config/cors.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import landlordAnnouncementRoutes from './src/modules/landlord/announcements/announcements.routes.js';
import landlordOnboardingRoutes from './src/modules/landlord/onboarding/onboarding.routes.js';
import landlordDashRoutes from './src/modules/landlord/dash/dash.routers.js';
import landlordTenantDirectoryRoutes from './src/modules/landlord/tenantdirectory/tenantdirectory.routes.js';
import landlordRentRollRoutes from './src/modules/landlord/rentroll/rentroll.routes.js';
import landlordPropertyRoutes from './src/modules/landlord/properties/properties.routes.js';
import landlordTicketRoutes from './src/modules/landlord/tickets/tickets.routes.js';
import landlordLeaseRoutes from './src/modules/landlord/lease/lease.routes.js';
import tenantAnnouncementRoutes from './src/modules/tenant/announcements/announcements.routes.js';
import tenantDashRoutes from './src/modules/tenant/dash/dash.routers.js';
import tenantPaymentsRoutes from './src/modules/tenant/payments/payments.routes.js';
import tenantTicketRoutes from './src/modules/tenant/tickets/tickets.routes.js';
import tenantLeaseRoutes from './src/modules/tenant/lease/lease.routes.js';

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

// Landlord routes
app.use('/api/landlord/dash', landlordDashRoutes);
app.use('/api/landlord/onboarding', landlordOnboardingRoutes);
app.use('/api/landlord/properties', landlordPropertyRoutes);
app.use('/api/landlord/tickets', landlordTicketRoutes);
app.use('/api/landlord/lease', landlordLeaseRoutes);
app.use('/api/landlord/announcements', landlordAnnouncementRoutes);
app.use('/api/landlord/tenantdirectory', landlordTenantDirectoryRoutes);
app.use('/api/landlord/rentroll', landlordRentRollRoutes);

// Tenant routes
app.use('/api/tenant/dash', tenantDashRoutes);
app.use('/api/tenant/announcements', tenantAnnouncementRoutes);
app.use('/api/tenant/payments', tenantPaymentsRoutes);
app.use('/api/tenant/tickets', tenantTicketRoutes);
app.use('/api/tenant/lease', tenantLeaseRoutes);

export default app;