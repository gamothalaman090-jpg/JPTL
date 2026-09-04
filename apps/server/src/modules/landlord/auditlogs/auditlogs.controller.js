import * as auditLogService from './auditlogs.service.js';

export async function getAuditLogs(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const result = await auditLogService.getLandlordAuditLogs(landlordId, req.query);
    return res.status(200).json({
      success: true,
      data: result,
      logs: result.logs,
      pagination: result.pagination,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
