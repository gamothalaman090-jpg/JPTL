import { Router } from 'express';
import {
  getTenantLedger,
  getPaymentReceipt,
  payRent,
  toggleAutoPay,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
} from './payments.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = Router();

// Restrict all tenant payment routes to authenticated tenants
router.use(requireAuth, requireRole('tenant'));

// GET /api/tenant/payments - Get tenant ledger, statement, summary & payment history
router.get('/', getTenantLedger);

// POST /api/tenant/payments/pay - Pay rent and receive official digital receipt
router.post('/pay', payRent);

// GET /api/tenant/payments/methods - List saved payment methods
router.get('/methods', getPaymentMethods);

// POST /api/tenant/payments/methods - Add a new payment method
router.post('/methods', addPaymentMethod);

// DELETE /api/tenant/payments/methods/:methodId - Delete a saved payment method
router.delete('/methods/:methodId', deletePaymentMethod);

// PATCH /api/tenant/payments/autopay - Toggle auto-pay status
router.patch('/autopay', toggleAutoPay);

// GET /api/tenant/payments/:id/receipt - Get official tax receipt for a cleared payment
router.get('/:id/receipt', getPaymentReceipt);

export default router;
