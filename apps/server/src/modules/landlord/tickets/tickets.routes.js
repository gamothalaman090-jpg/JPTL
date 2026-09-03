import { Router } from 'express';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import * as ticketController from './tickets.controller.js';

const router = Router();

// Protect all routes: Landlord only
router.use(requireAuth, requireRole('landlord'));

router.get('/', ticketController.getTickets);
router.post('/', ticketController.createTicket);
router.get('/:id', ticketController.getTicketById);
router.patch('/:id/status', ticketController.updateTicketStatus);
router.patch('/:id/assign', ticketController.assignTechnician);
router.delete('/:id', ticketController.deleteTicket);

export default router;
