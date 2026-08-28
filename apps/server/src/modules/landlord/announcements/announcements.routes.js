import { Router } from 'express';
import { createAnnouncement, getMyAnnouncements } from './announcements.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = Router();

// Restrict entire router to landlords
router.use(requireAuth, requireRole('landlord'));

// GET /api/landlord/announcements (Fetches only this landlord's notices)
router.get('/', getMyAnnouncements);

// POST /api/landlord/announcements
router.post('/', createAnnouncement);

export default router;