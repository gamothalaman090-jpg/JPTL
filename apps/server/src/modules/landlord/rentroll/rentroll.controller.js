import * as rentRollService from './rentroll.service.js';
import { getLandlordScopeId } from '../../../shared/utils/landlordScope.js';

export async function getRentRoll(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const result = await rentRollService.getRentRoll(landlordId, req.query);
    return res.status(200).json({
      success: true,
      summary: result.summary,
      count: result.payments.length,
      data: result.payments,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function getRentRollKpi(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const summary = await rentRollService.getRentRollKpi(landlordId);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function getPaymentById(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const { id } = req.params;
    const payment = await rentRollService.getPaymentById(landlordId, id);
    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function createPaymentInvoice(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const payment = await rentRollService.createPaymentInvoice(landlordId, req.body, ipAddress);
    return res.status(201).json({
      success: true,
      message: 'Payment invoice created successfully',
      data: payment,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function markPaymentAsPaid(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const payment = await rentRollService.markPaymentAsPaid(landlordId, id, req.body, ipAddress);
    return res.status(200).json({
      success: true,
      message: 'Payment marked as paid successfully',
      data: payment,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function reviewPayment(req, res) {
  try {
    const payment = await rentRollService.reviewPayment(getLandlordScopeId(req.user), req.params.id, req.body, req.ip || '');
    return res.status(200).json({ success: true, data: payment });
  } catch (err) {
    return res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
}

export async function getPaymentEvidence(req, res) {
  try {
    const evidence = await rentRollService.getLandlordPaymentEvidence(getLandlordScopeId(req.user), req.params.id);
    const safeName = evidence.name.replace(/[\r\n"\\]/g, '_');
    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    evidence.stream.pipe(res);
  } catch (err) {
    return res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
}

export async function updatePayment(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const payment = await rentRollService.updatePayment(landlordId, id, req.body, ipAddress);
    return res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deletePayment(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const result = await rentRollService.deletePayment(landlordId, id, ipAddress);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function exportRentRoll(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const result = await rentRollService.exportRentRoll(landlordId, req.query);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
