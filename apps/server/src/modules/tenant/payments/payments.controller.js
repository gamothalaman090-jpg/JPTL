import asyncHandler from '../../../shared/middleware/asyncHandler.middleware.js';
import * as tenantPaymentService from './payments.service.js';

export const getTenantLedger = asyncHandler(async (req, res) => {
  const tenantId = req.user.id;
  const ledger = await tenantPaymentService.getTenantLedger(tenantId);
  return res.status(200).json({ success: true, data: ledger });
});

export const getPaymentOptions = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await tenantPaymentService.getTenantPaymentOptions(req.user.id) });
});

export const getOrCreateCurrentInvoice = asyncHandler(async (req, res) => {
  const invoice = await tenantPaymentService.getOrCreateCurrentRentInvoice(req.user.id, req.ip || '');
  res.status(200).json({ success: true, data: invoice });
});

export const createAdvanceInvoice = asyncHandler(async (req, res) => {
  const invoice = await tenantPaymentService.createAdvanceRentInvoice(req.user.id, req.body, req.ip || '');
  res.status(201).json({ success: true, data: invoice });
});

export const discardAdvanceRentDraft = asyncHandler(async (req, res) => {
  const result = await tenantPaymentService.discardAdvanceRentDraft(req.user.id, req.params.id, req.ip || '');
  res.status(200).json({ success: true, data: result });
});

export const submitPaymentEvidence = asyncHandler(async (req, res) => {
  const result = await tenantPaymentService.submitPaymentEvidence(req.user.id, req.params.id, req.body, req.file, req.ip || '');
  res.status(201).json({ success: true, data: result });
});

export const submitOnsitePayment = asyncHandler(async (req, res) => {
  const result = await tenantPaymentService.submitOnsitePayment(req.user.id, req.params.id, req.body, req.ip || '');
  res.status(201).json({ success: true, data: result });
});

export const getPaymentEvidence = asyncHandler(async (req, res) => {
  const evidence = await tenantPaymentService.getTenantPaymentEvidence(req.user.id, req.params.id);
  const safeName = evidence.name.replace(/[\r\n"\\]/g, '_');
  res.setHeader('Content-Type', evidence.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
  evidence.stream.pipe(res);
});

export async function getPaymentReceipt(req, res) {
  try {
    const tenantId = req.user.id;
    const { id } = req.params;
    const receipt = await tenantPaymentService.getPaymentReceipt(tenantId, id);
    return res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function payRent(req, res) {
  try {
    const tenantId = req.user.id;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const result = await tenantPaymentService.payRent(tenantId, req.body, ipAddress);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.receipt,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function toggleAutoPay(req, res) {
  try {
    const tenantId = req.user.id;
    const { enabled } = req.body;
    const result = await tenantPaymentService.toggleAutoPay(tenantId, enabled);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: { autoPayEnabled: result.autoPayEnabled },
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function getPaymentMethods(req, res) {
  try {
    const tenantId = req.user.id;
    const methods = await tenantPaymentService.getPaymentMethods(tenantId);
    return res.status(200).json({
      success: true,
      data: methods,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function addPaymentMethod(req, res) {
  try {
    const tenantId = req.user.id;
    const method = await tenantPaymentService.addPaymentMethod(tenantId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: method,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deletePaymentMethod(req, res) {
  try {
    const tenantId = req.user.id;
    const { methodId } = req.params;
    const result = await tenantPaymentService.deletePaymentMethod(tenantId, methodId);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/tenant/payments/pay-advance
 * Pay 1+ months in advance, bounded to the active lease end date
 */
export const payAdvance = asyncHandler(async (req, res) => {
  const tenantId = req.user.id;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
  const result = await tenantPaymentService.payInAdvance(tenantId, req.body, ipAddress);
  return res.status(200).json({
    success: true,
    message: `Successfully paid ${result.monthsPaid} month(s) in advance.`,
    data: result,
  });
});
