import { Router } from 'express';
import {
  getRentRoll,
  getRentRollKpi,
  getPaymentById,
  createPaymentInvoice,
  markPaymentAsPaid,
  updatePayment,
  deletePayment,
  exportRentRoll,
} from './rentroll.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = Router();

// Restrict all rentroll endpoints to authenticated landlords
router.use(requireAuth, requireRole('landlord'));

// GET /api/landlord/rentroll - Get rent roll transactions & summary
router.get('/', getRentRoll);

// GET /api/landlord/rentroll/kpi - Quick summary KPIs
router.get('/kpi', getRentRollKpi);

// GET /api/landlord/rentroll/export - Export rent roll CSV / data
router.get('/export', exportRentRoll);

// POST /api/landlord/rentroll - Create payment invoice
router.post('/', createPaymentInvoice);

// GET /api/landlord/rentroll/:id - Get single payment detail
router.get('/:id', getPaymentById);

// PATCH /api/landlord/rentroll/:id/mark-paid - Mark payment as paid
router.patch('/:id/mark-paid', markPaymentAsPaid);

// PUT /api/landlord/rentroll/:id - Update payment details
router.put('/:id', updatePayment);

// DELETE /api/landlord/rentroll/:id - Delete / void payment invoice
router.delete('/:id', deletePayment);

export default router;
