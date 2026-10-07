import { Router } from 'express';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import * as staffController from './staff.controller.js';

const router = Router();
router.use(requireAuth, requireRole('landlord'));
router.get('/', staffController.listStaff);
router.post('/', staffController.inviteStaff);
router.delete('/:id', staffController.deactivateStaff);

export default router;
