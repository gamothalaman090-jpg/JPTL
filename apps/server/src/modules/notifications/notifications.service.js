import { Notification, PushSubscription } from '../../shared/models/notification.model.js';
import { sendWebPush, getVapidPublicKey } from '../../shared/utils/webpush.js';

export async function getUserNotifications(userId, query = {}) {
  const filter = { user: userId };
  if (query.unreadOnly === 'true') {
    filter.read = false;
  }
  if (query.type && query.type !== 'all') {
    filter.type = query.type;
  }

  const limit = Math.min(parseInt(query.limit, 10) || 50, 100);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({ user: userId, read: false });

  return {
    notifications,
    unreadCount,
    vapidPublicKey: getVapidPublicKey(),
  };
}

export async function markNotificationAsRead(userId, notificationId) {
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
  if (!updated) {
    const error = new Error('Notification not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  const unreadCount = await Notification.countDocuments({ user: userId, read: false });
  return { notification: updated, unreadCount };
}

export async function markAllNotificationsAsRead(userId) {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
  return { message: 'All notifications marked as read', unreadCount: 0 };
}

export async function savePushSubscription(userId, subscription) {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    const error = new Error('Invalid push subscription payload');
    error.statusCode = 400;
    throw error;
  }

  await PushSubscription.findOneAndUpdate(
    { user: userId, endpoint: subscription.endpoint },
    {
      user: userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    { upsert: true, new: true }
  );

  return { message: 'Push notification subscription saved successfully' };
}

/**
 * Dispatches both in-app notification record and web-push alert.
 */
export async function dispatchNotification({ userId, title, body, type = 'system', data = {} }) {
  // 1. Create in-app notification
  const notification = await Notification.create({
    user: userId,
    title,
    body,
    type,
    data,
  });

  // 2. Dispatch push to all user's registered devices
  try {
    const subscriptions = await PushSubscription.find({ user: userId });
    for (const sub of subscriptions) {
      const res = await sendWebPush(sub, { title, body, data });
      if (res.isExpired) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
    }
  } catch (err) {
    console.error('Error dispatching web-push notification:', err.message);
  }

  return notification;
}
