import { Router } from 'express';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import * as leaseController from './lease.controller.js';

const router = Router();

// Protect all routes: Tenant only
router.use(requireAuth, requireRole('tenant'));

router.get('/', leaseController.getLease);
router.post('/extension', leaseController.requestExtension);
router.get('/document', leaseController.getLeaseDocument);

export default router;
