import { Router } from 'express';
import { getFeed, getById } from './announcements.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = Router();

// Restrict entire router to logged-in tenants
router.use(requireAuth, requireRole('tenant'));

// GET /api/tenant/announcements (Only fetches notices from tenant's landlord)
router.get('/', getFeed);

// GET /api/tenant/announcements/:id
router.get('/:id', getById);

export default router;