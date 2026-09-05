import express from 'express';
import * as authController from './auth.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', authController.signupLandlord);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.patch('/profile', requireAuth, authController.updateProfile);
router.patch('/change-password', requireAuth, authController.changePassword);

export default router;