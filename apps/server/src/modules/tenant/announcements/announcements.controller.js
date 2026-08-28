import * as announcementService from './announcements.service.js';

export async function getFeed(req, res) {
  try {
    const tenantId = req.user.id;
    const { category, search, page, limit } = req.query;

    const result = await announcementService.getTenantFeed(tenantId, {
      category,
      search,
      page,
      limit,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getById(req, res) {
  try {
    const notice = await announcementService.getAnnouncementById(req.params.id);
    return res.status(200).json({ success: true, data: notice });
  } catch (err) {
    const statusCode = err.message === 'Notice not found' ? 404 : 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}