import * as leaseService from './lease.service.js';
import { generateLeasePdf } from '../../../shared/utils/pdfGenerator.js';

export async function getLease(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const lease = await leaseService.getTenantLease(tenantId);
    return res.status(200).json({ success: true, data: lease });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function requestExtension(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await leaseService.requestLeaseExtension(tenantId, req.body, ipAddress);
    return res.status(201).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function requestEarlyTermination(req, res) {
  try {
    const result = await leaseService.requestEarlyTermination(req.user._id || req.user.id, req.body, req.ip || '');
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
}

export async function getLeaseDocument(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const doc = await leaseService.getLeaseDocument(tenantId);

    const safeName = `${doc.propertyName}-${doc.unitLabel}-Lease-Agreement`
      .replace(/[^a-zA-Z0-9-_]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);

    generateLeasePdf(doc, res);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
