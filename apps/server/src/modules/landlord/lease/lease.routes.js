import { Router } from 'express';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import * as landlordLeaseController from './lease.controller.js';

const router = Router();

// Protect all routes: Landlord only
router.use(requireAuth, requireRole('landlord'));

router.get('/extensions', landlordLeaseController.getLeasesAndExtensions);
router.patch('/:leaseId/extensions/:requestId/review', landlordLeaseController.reviewExtension);

export default router;
