import express from 'express';
import * as auditLogController from './auditlogs.controller.js';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('landlord', 'superadmin'));

router.get('/', auditLogController.getAuditLogs);

export default router;
