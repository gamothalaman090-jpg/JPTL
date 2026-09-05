import * as tenantDocService from './documents.service.js';

export async function getDocuments(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const result = await tenantDocService.getTenantDocuments(tenantId, req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function submitDocument(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const file = req.file || null;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const doc = await tenantDocService.submitTenantDocument(tenantId, req.body, file, ipAddress);
    return res.status(201).json({ success: true, message: 'Document submitted for review', data: doc });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deleteDocument(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await tenantDocService.deleteTenantDocument(tenantId, req.params.id, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
