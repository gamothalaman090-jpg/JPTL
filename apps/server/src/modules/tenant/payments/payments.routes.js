import { Router } from 'express';
import {
  getTenantLedger,
  getPaymentReceipt,
  payRent,
  payAdvance,
  toggleAutoPay,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  getPaymentOptions,
  submitPaymentEvidence,
  submitOnsitePayment,
  getPaymentEvidence,
  getOrCreateCurrentInvoice,
  createAdvanceInvoice,
  discardAdvanceRentDraft,
} from './payments.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import { strictActionLimiter } from '../../../shared/middleware/rateLimiter.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 } });

const router = Router();

// Restrict all tenant payment routes to authenticated tenants
router.use(requireAuth, requireRole('tenant'));

// GET /api/tenant/payments - Get tenant ledger, statement, summary & payment history
router.get('/', getTenantLedger);
router.post('/current-invoice', getOrCreateCurrentInvoice);
router.post('/advance-invoice', strictActionLimiter, createAdvanceInvoice);
router.delete('/:id/advance-draft', discardAdvanceRentDraft);
router.get('/options', getPaymentOptions);
router.post('/:id/submit', upload.single('receipt'), submitPaymentEvidence);
router.post('/:id/pay-onsite', submitOnsitePayment);
router.get('/:id/evidence', getPaymentEvidence);

// POST /api/tenant/payments/pay - Pay rent and receive official digital receipt
router.post('/pay', payRent);

// POST /api/tenant/payments/pay-advance - Pay months in advance (bounded to lease end)
router.post('/pay-advance', strictActionLimiter, payAdvance);

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
