import express from 'express';
import * as vehicleController from './vehicles.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('tenant'));

router.get('/', vehicleController.getVehicles);
router.post('/', vehicleController.addVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

export default router;
