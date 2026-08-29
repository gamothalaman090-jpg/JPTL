import { getTenantDashboard, getTenantKpi, TenantDashError } from './dash.service.js';

/**
 * GET /api/tenant/dash
 * Full tenant dashboard payload.
 */
async function getDashboard(req, res) {
  try {
    const data = await getTenantDashboard(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err instanceof TenantDashError ? err.statusCode : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/tenant/dash/kpi
 * Lightweight KPI snapshot for badge refresh.
 */
async function getKpi(req, res) {
  try {
    const data = await getTenantKpi(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err instanceof TenantDashError ? err.statusCode : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}

export { getDashboard, getKpi };
