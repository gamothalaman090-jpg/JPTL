import { Router } from 'express';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import * as landlordDocController from './documents.controller.js';

const router = Router();

// Protect all routes: Landlord only
router.use(requireAuth, requireRole('landlord'));

router.get('/', landlordDocController.getDocuments);
router.get('/reminder-settings', landlordDocController.getReminderSettings);
router.patch('/reminder-settings', landlordDocController.updateReminderSettings);
router.get('/:id/file', landlordDocController.getDocumentFile);
router.patch('/:id/verify', landlordDocController.verifyDocument);
router.delete('/:id', landlordDocController.deleteDocument);

export default router;
