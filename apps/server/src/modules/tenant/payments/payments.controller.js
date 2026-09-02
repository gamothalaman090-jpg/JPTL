import * as tenantPaymentService from './payments.service.js';

export async function getTenantLedger(req, res) {
  try {
    const tenantId = req.user.id;
    const ledger = await tenantPaymentService.getTenantLedger(tenantId);
    return res.status(200).json({
      success: true,
      data: ledger,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

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
