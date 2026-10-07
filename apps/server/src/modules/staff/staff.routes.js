import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth.middleware.js';
import { getStaffDashboard } from './staff.controller.js';

const router = Router();
router.use(requireAuth, requireRole('staff'));
router.get('/dashboard', getStaffDashboard);

export default router;
