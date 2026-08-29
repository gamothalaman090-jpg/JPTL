import { Router } from 'express';
import * as onboardingController from './onboarding.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = Router();

// Protect all onboarding routes - Landlord role required
router.use(requireAuth, requireRole('landlord'));

// GET /api/landlord/onboarding/status - Check setup status and counts
router.get('/status', onboardingController.getStatus);

// POST /api/landlord/onboarding/plan - Select / update portfolio tier
router.post('/plan', onboardingController.savePlan);

// POST /api/landlord/onboarding/properties - Create property during onboarding
router.post('/properties', onboardingController.addProperty);

// POST /api/landlord/onboarding/units - Create unit for a property during onboarding
router.post('/units', onboardingController.addUnit);

// POST /api/landlord/onboarding/tenants - Pre-register / assign tenant
router.post('/tenants', onboardingController.addTenant);

// POST /api/landlord/onboarding/announcement - Create welcome broadcast
router.post('/announcement', onboardingController.postAnnouncement);

// POST /api/landlord/onboarding/complete - Complete onboarding with all-in-one payload
router.post('/complete', onboardingController.completeOnboarding);

export default router;
