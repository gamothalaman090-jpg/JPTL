import * as landlordLeaseService from './lease.service.js';

export async function getLeasesAndExtensions(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const result = await landlordLeaseService.getLandlordLeasesAndExtensions(landlordId);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function reviewExtension(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const { leaseId, requestId } = req.params;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await landlordLeaseService.reviewLeaseExtension(landlordId, leaseId, requestId, req.body, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
