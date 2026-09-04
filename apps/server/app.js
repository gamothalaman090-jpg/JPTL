import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './src/shared/config/cors.js';
import { requestIdMiddleware } from './src/shared/middleware/requestId.middleware.js';
import { securityHeadersMiddleware } from './src/shared/middleware/securityHeaders.middleware.js';
import { compressionMiddleware } from './src/shared/middleware/compression.middleware.js';
import { sanitizeMiddleware } from './src/shared/middleware/sanitize.middleware.js';
import { requestLoggerMiddleware } from './src/shared/middleware/requestLogger.middleware.js';
import { generalLimiter, authLimiter } from './src/shared/middleware/rateLimiter.middleware.js';
import { notFoundMiddleware, errorHandlerMiddleware } from './src/shared/middleware/errorHandler.middleware.js';

// Route imports
import authRoutes from './src/modules/auth/auth.routes.js';
import landlordAnnouncementRoutes from './src/modules/landlord/announcements/announcements.routes.js';
import landlordOnboardingRoutes from './src/modules/landlord/onboarding/onboarding.routes.js';
import landlordDashRoutes from './src/modules/landlord/dash/dash.routers.js';
import landlordTenantDirectoryRoutes from './src/modules/landlord/tenantdirectory/tenantdirectory.routes.js';
import landlordRentRollRoutes from './src/modules/landlord/rentroll/rentroll.routes.js';
import landlordPropertyRoutes from './src/modules/landlord/properties/properties.routes.js';
import landlordTicketRoutes from './src/modules/landlord/tickets/tickets.routes.js';
import landlordLeaseRoutes from './src/modules/landlord/lease/lease.routes.js';
import landlordDocumentRoutes from './src/modules/landlord/documents/documents.routes.js';
import tenantAnnouncementRoutes from './src/modules/tenant/announcements/announcements.routes.js';
import tenantDashRoutes from './src/modules/tenant/dash/dash.routers.js';
import tenantPaymentsRoutes from './src/modules/tenant/payments/payments.routes.js';
import tenantTicketRoutes from './src/modules/tenant/tickets/tickets.routes.js';
import tenantLeaseRoutes from './src/modules/tenant/lease/lease.routes.js';
import tenantDocumentRoutes from './src/modules/tenant/documents/documents.routes.js';

const app = express();

// 1. Request ID / Correlation ID tracking
app.use(requestIdMiddleware);

// 2. HTTP Security Headers (Helmet)
app.use(securityHeadersMiddleware);

// 3. Cross-Origin Resource Sharing
app.use(cors(corsOptions));

// 4. Response Compression (Gzip / Brotli)
app.use(compressionMiddleware);

// 5. Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 6. Input Sanitization & NoSQL Injection Protection
app.use(sanitizeMiddleware);

// 7. Request Logger & Profiler
app.use(requestLoggerMiddleware);

// 8. Global Rate Limiter for all API routes
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running', requestId: req.id });
});

// Authentication routes with strict brute-force rate limiter
app.use('/api/auth', authLimiter, authRoutes);

// Landlord routes
app.use('/api/landlord/dash', landlordDashRoutes);
app.use('/api/landlord/onboarding', landlordOnboardingRoutes);
app.use('/api/landlord/properties', landlordPropertyRoutes);
app.use('/api/landlord/tickets', landlordTicketRoutes);
app.use('/api/landlord/lease', landlordLeaseRoutes);
app.use('/api/landlord/documents', landlordDocumentRoutes);
app.use('/api/landlord/announcements', landlordAnnouncementRoutes);
app.use('/api/landlord/tenantdirectory', landlordTenantDirectoryRoutes);
app.use('/api/landlord/rentroll', landlordRentRollRoutes);

// Tenant routes
app.use('/api/tenant/dash', tenantDashRoutes);
app.use('/api/tenant/announcements', tenantAnnouncementRoutes);
app.use('/api/tenant/payments', tenantPaymentsRoutes);
app.use('/api/tenant/tickets', tenantTicketRoutes);
app.use('/api/tenant/lease', tenantLeaseRoutes);
app.use('/api/tenant/documents', tenantDocumentRoutes);

// 9. 404 Route Not Found Handler
app.use(notFoundMiddleware);

// 10. Centralized Global Error Handler
app.use(errorHandlerMiddleware);

export default app;