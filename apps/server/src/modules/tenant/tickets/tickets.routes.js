import { Router } from 'express';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import * as tenantTicketController from './tickets.controller.js';

const router = Router();

// Protect all routes: Tenant only
router.use(requireAuth, requireRole('tenant'));

router.get('/', tenantTicketController.getTickets);
router.post('/', tenantTicketController.submitTicket);
router.get('/:id', tenantTicketController.getTicketById);
router.patch('/:id/cancel', tenantTicketController.cancelTicket);
router.post('/:id/comments', tenantTicketController.addComment);

export default router;
