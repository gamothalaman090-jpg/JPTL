import webpush from 'web-push';
import PushSubscription from '../models/pushSubscription.model.js';

let vapidInitialized = false;

function ensureVapidInitialized() {
  if (vapidInitialized) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@jptl.app';
  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not configured — push notifications disabled');
    return;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidInitialized = true;
}


/**
 * Save or update a push subscription for a user.
 * @param {string} userId
 * @param {{ endpoint: string, keys: { p256dh: string, auth: string } }} subscription
 */
export async function saveSubscription(userId, subscription) {
  ensureVapidInitialized();
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error('Invalid push subscription payload');
  }

  await PushSubscription.findOneAndUpdate(
    { user: userId, endpoint },
    { user: userId, endpoint, keys },
    { upsert: true, new: true }
  );
}

/**
 * Send a push notification to one or more users.
 * @param {string|string[]} userIds  — MongoDB user IDs to notify
 * @param {{ title: string, body: string, icon?: string, url?: string }} payload
 */
export async function sendPushToUsers(userIds, payload) {
  ensureVapidInitialized();
  if (!vapidInitialized) return; // VAPID not configured, skip silently
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (!ids.length) return;

  const subscriptions = await PushSubscription.find({ user: { $in: ids } }).lean();
  if (!subscriptions.length) return;

  const notification = JSON.stringify({
    title: payload.title || 'JPTL Notification',
    body: payload.body || '',
    icon: payload.icon || '/favicon.svg',
    badge: '/favicon.svg',
    url: payload.url || '/',
    timestamp: new Date().toISOString(),
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        notification,
        { TTL: 86400 } // 24 hours
      )
    )
  );

  // Clean up expired / invalid subscriptions (410 Gone)
  const expiredEndpoints = [];
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const status = r.reason?.statusCode;
      if (status === 410 || status === 404) {
        expiredEndpoints.push(subscriptions[i].endpoint);
      }
    }
  });

  if (expiredEndpoints.length) {
    await PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } });
  }
}
