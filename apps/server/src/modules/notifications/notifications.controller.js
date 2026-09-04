import * as notificationService from './notifications.service.js';

export async function getNotifications(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await notificationService.getUserNotifications(userId, req.query);
    return res.status(200).json({ success: true, data: result.notifications, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export function getVapidKey(req, res) {
  return res.status(200).json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
  });
}

export async function markAsRead(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await notificationService.markNotificationAsRead(userId, req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await notificationService.markAllNotificationsAsRead(userId);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function subscribe(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await notificationService.savePushSubscription(userId, req.body.subscription);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
