import { getLandlordDashboard, getLandlordKpi, DashError } from './dash.service.js';

/**
 * GET /api/landlord/dash
 * Full dashboard payload — properties, KPIs, recent tickets, payments, pinned announcement.
 */
async function getDashboard(req, res) {
  try {
    const data = await getLandlordDashboard(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err instanceof DashError ? err.statusCode : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/landlord/dash/kpi
 * Lightweight KPI snapshot — suitable for background polling / badge refresh.
 */
async function getKpi(req, res) {
  try {
    const data = await getLandlordKpi(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err instanceof DashError ? err.statusCode : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}

export { getDashboard, getKpi };
