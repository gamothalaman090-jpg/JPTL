import Announcement from '../../../shared/models/announcements.model.js';
import User from '../../../shared/models/user.model.js';

export async function getTenantFeed(tenantId, { category, search, page = 1, limit = 20 }) {
  // 1. Find tenant to extract their assigned landlord ID
  const tenant = await User.findById(tenantId);
  if (!tenant || !tenant.landlord) {
    return { announcements: [], meta: { total: 0, page: 1, pages: 0 } };
  }

  // 2. Query announcements strictly created by their assigned landlord
  const query = { author: tenant.landlord };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [announcements, total] = await Promise.all([
    Announcement.find(query)
      .populate('author', 'firstName lastName role')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Announcement.countDocuments(query),
  ]);

  return {
    announcements,
    meta: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getAnnouncementById(announcementId) {
  const notice = await Announcement.findById(announcementId).populate('author', 'firstName lastName role');
  if (!notice) {
    throw new Error('Notice not found');
  }
  return notice;
}