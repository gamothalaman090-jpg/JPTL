import express from 'express';
import * as notificationController from './notifications.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', notificationController.getNotifications);
router.get('/vapid-key', notificationController.getVapidKey);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/subscribe', notificationController.subscribe);

export default router;
