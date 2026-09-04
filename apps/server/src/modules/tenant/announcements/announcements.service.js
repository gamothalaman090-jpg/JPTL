import Announcement from '../../../shared/models/announcements.model.js';
import User from '../../../shared/models/user.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';

export async function getTenantFeed(tenantId, { category, search, page = 1, limit = 20 }) {
  // 1. Find tenant to extract their assigned landlord ID
  const tenant = await User.findById(tenantId);
  if (!tenant) {
    return { announcements: [], meta: { total: 0, page: 1, pages: 0 } };
  }

  let landlordId = tenant.landlord;
  if (!landlordId) {
    const profile = await TenantProfile.findOne({ user: tenantId }).populate('property');
    landlordId = profile?.property?.landlord || null;
  }
  if (!landlordId) {
    const anyAdmin = await User.findOne({ role: 'landlord' }).select('_id');
    landlordId = anyAdmin?._id;
  }

  if (!landlordId) {
    return { announcements: [], meta: { total: 0, page: 1, pages: 0 } };
  }

  // 2. Query announcements strictly created by their assigned landlord
  const query = { author: landlordId };

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

  const [rawAnnouncements, total] = await Promise.all([
    Announcement.find(query)
      .populate('author', 'firstName lastName role')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Announcement.countDocuments(query),
  ]);

  const announcements = rawAnnouncements.map((a) => ({
    ...a,
    id: a._id,
    body: a.content,
  }));

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