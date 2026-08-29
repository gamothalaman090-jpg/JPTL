import Announcement from '../../../shared/models/announcements.model.js';

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