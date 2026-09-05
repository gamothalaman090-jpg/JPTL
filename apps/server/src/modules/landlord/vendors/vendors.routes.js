import express from 'express';
import * as vendorController from './vendors.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('landlord', 'superadmin'));

router.get('/', vendorController.getVendors);
router.post('/', vendorController.createVendor);
router.patch('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

export default router;
