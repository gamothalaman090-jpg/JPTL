import webpush from 'web-push';

let isVapidConfigured = false;

function initVapid() {
  if (isVapidConfigured) return true;

  const subject = process.env.VAPID_SUBJECT || 'mailto:siege.ozzy@gmail.com';
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (publicKey && privateKey) {
    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      isVapidConfigured = true;
      return true;
    } catch (err) {
      console.error('⚠️ [WebPush] Failed to configure VAPID keys:', err.message);
      return false;
    }
  }

  return false;
}

/**
 * Send Web-Push VAPID notification to a client subscription.
 *
 * @param {object} subscription - { endpoint, keys: { p256dh, auth } }
 * @param {object} payload - { title, body, icon, url, data }
 */
export async function sendWebPush(subscription, payload) {
  if (!initVapid()) {
    return { success: false, reason: 'VAPID keys not configured' };
  }

  if (!subscription || !subscription.endpoint) {
    return { success: false, reason: 'Invalid subscription object' };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title || 'JPTL Notification',
    body: payload.body || '',
    icon: payload.icon || '/favicon.ico',
    data: payload.data || {},
    timestamp: Date.now(),
  });

  try {
    const result = await webpush.sendNotification(subscription, notificationPayload);
    return { success: true, statusCode: result.statusCode };
  } catch (err) {
    // 410 Gone or 404 Not Found indicates expired subscription
    const isExpired = err.statusCode === 410 || err.statusCode === 404;
    return { success: false, error: err.message, statusCode: err.statusCode, isExpired };
  }
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || '';
}
