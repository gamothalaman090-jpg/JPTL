import { Router } from 'express';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import { getDashboard, getKpi } from './dash.controller.js';

const router = Router();

// All landlord dash routes require a valid JWT and the 'landlord' role
router.use(requireAuth, requireRole('landlord'));

/**
 * @route  GET /api/landlord/dash
 * @desc   Full dashboard payload
 * @access Private (landlord)
 */
router.get('/', getDashboard);

/**
 * @route  GET /api/landlord/dash/kpi
 * @desc   Lightweight KPI snapshot (badge refresh)
 * @access Private (landlord)
 */
router.get('/kpi', getKpi);

export default router;
