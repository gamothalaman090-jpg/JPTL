import { Router } from 'express';
import { createAnnouncement, getMyAnnouncements, deleteAnnouncement } from './announcements.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = Router();

// Restrict entire router to landlords
router.use(requireAuth);

// GET /api/landlord/announcements (Fetches only this landlord's notices)
router.get('/', requireRole('landlord', 'staff'), getMyAnnouncements);

// POST /api/landlord/announcements
router.post('/', requireRole('landlord', 'staff'), createAnnouncement);

// DELETE /api/landlord/announcements/:id
router.delete('/:id', requireRole('landlord'), deleteAnnouncement);

export default router;
