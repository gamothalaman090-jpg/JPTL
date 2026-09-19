import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './src/shared/config/cors.js';
import { swaggerUi, swaggerSpec } from './src/shared/config/swagger.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import superadminRoutes from './src/modules/superadmin/superadmin.routes.js';
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
import notificationRoutes from './src/modules/notifications/notification.routes.js';
import vehicleRoutes from './src/modules/tenant/vehicle/vehicle.routes.js';
import { generalLimiter, authLimiter } from './src/shared/middleware/rateLimiter.middleware.js';
import { checkMaintenanceMode } from './src/shared/middleware/maintenance.middleware.js';
import { getMaintenanceState } from './src/shared/services/systemState.service.js';

const app = express();

// Disable X-Powered-By explicitly
app.disable('x-powered-by');

// Early path traversal and invalid sequence shield
app.use((req, res, next) => {
  const urlToCheck = req.originalUrl || req.url || '';
  // Check for path traversal sequences (raw, urlencoded, or backslash variants)
  if (
    urlToCheck.includes('..') ||
    /%2e%2e/i.test(urlToCheck) ||
    /%2f%2e%2e/i.test(urlToCheck) ||
    /%5c/i.test(urlToCheck) ||
    /\0|%00/.test(urlToCheck)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request: Invalid path traversal sequence detected',
    });
  }
  next();
});

// Suppress server fingerprinting headers on all responses
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
});

// Strict Cross-Domain Flash / Silverlight discovery block (OWASP ZAP Cross-Domain Misconfiguration fix)
app.get(['/crossdomain.xml', '/clientaccesspolicy.xml'], (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send('<cross-domain-policy><site-control permitted-cross-domain-policies="none"/></cross-domain-policy>');
});

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://validator.swagger.io'],
        connectSrc: ["'self'", 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:8000', 'https:'],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' }, // Anti-clickjacking: X-Frame-Options: DENY
    noSniff: true,                  // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Swagger Documentation UI (Accessible at /api/docs)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Caching policy optimized for Vercel Edge & Serverless Workers:
// - Safe GET reads use short SWR (s-maxage=3, stale-while-revalidate=15) for sub-50ms edge responses
// - Mutations (POST/PUT/PATCH/DELETE) and auth endpoints strictly bypass cache
app.use('/api', (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/auth') && !req.path.includes('export')) {
    res.setHeader('Cache-Control', 'public, s-maxage=3, stale-while-revalidate=15');
  } else {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});
app.use('/api', generalLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Public platform status (checks if maintenance mode is active)
app.get('/api/system/status', async (req, res) => {
  const state = await getMaintenanceState();
  res.status(200).json({
    success: true,
    maintenance: state.enabled,
    message: state.message,
    timestamp: state.updatedAt ? new Date(state.updatedAt).toISOString() : new Date().toISOString(),
  });
});

// Maintenance mode barrier (intercepts non-superadmin traffic when active)
app.use(checkMaintenanceMode);

// Authentication routes
app.use('/api/auth', authRoutes);

// Superadmin routes (Always accessible to superadmins)
app.use('/api/superadmin', superadminRoutes);

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
app.use('/api/tenant/vehicles', vehicleRoutes);

// Shared notification routes (VAPID key + push subscribe)
app.use('/api/notifications', notificationRoutes);

export default app;