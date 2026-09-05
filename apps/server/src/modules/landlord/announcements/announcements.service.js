import Announcement from '../../../shared/models/announcements.model.js';
import User from '../../../shared/models/user.model.js';
import { sendAnnouncementEmail } from '../../../shared/utils/mailer.js';
import { dispatchNotification } from '../../notifications/notifications.service.js';

/**
 * Create a new announcement for the logged-in landlord
 */
export async function createAnnouncement(authorId, data) {
  const { title, content, category, isPinned } = data;

  if (!title?.trim() || !content?.trim()) {
    throw new Error('Title and content are required');
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    content: content.trim(),
    category: category || 'General',
    isPinned: Boolean(isPinned),
    author: authorId,
  });

  // Asynchronously notify all active tenants under this landlord
  (async () => {
    try {
      const landlord = await User.findById(authorId).select('firstName lastName').lean();
      const authorName = landlord ? `${landlord.firstName} ${landlord.lastName}` : 'Property Management';
      const tenants = await User.find({ landlord: authorId, role: 'tenant', status: 'active' }).select('email _id').lean();

      if (tenants && tenants.length > 0) {
        const emails = tenants.map((t) => t.email).filter(Boolean);

        // 1. Send broadcast email
        sendAnnouncementEmail({
          recipients: emails,
          title: announcement.title,
          content: announcement.content,
          category: announcement.category,
          authorName,
        }).catch((err) => console.error('Error sending announcement emails:', err.message));

        // 2. Dispatch in-app and web-push notifications
        for (const tenant of tenants) {
          dispatchNotification({
            userId: tenant._id,
            title: `Announcement: ${announcement.title}`,
            body: announcement.content.slice(0, 120),
            type: 'announcement',
            data: { announcementId: announcement._id },
          }).catch((err) => console.error('Error dispatching notification:', err.message));
        }
      }
    } catch (err) {
      console.error('Error in announcement notification workflow:', err.message);
    }
  })();

  return announcement.populate('author', 'firstName lastName role');
}

/**
 * Retrieve only the announcements created by the logged-in landlord
 */
export async function getLandlordAnnouncements(landlordId, { category, search }) {
  // Filter exclusively by the logged-in landlord's user ID
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

  return await Announcement.find(query)
    .populate('author', 'firstName lastName role')
    .sort({ isPinned: -1, createdAt: -1 });
}