import { Router } from 'express';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware.js';
import * as controller from './evictions.controller.js';

export const landlordEvictionsRouter = Router();
landlordEvictionsRouter.use(requireAuth, requireRole('landlord'));
landlordEvictionsRouter.get('/', controller.getLandlordNotices);
landlordEvictionsRouter.post('/', controller.createEvictionNotice);
landlordEvictionsRouter.patch('/:noticeId/cancel', controller.cancelEvictionNotice);
landlordEvictionsRouter.delete('/:noticeId', controller.deleteCanceledNotice);
landlordEvictionsRouter.post('/:leaseId/override', controller.overrideEviction);

export const tenantEvictionsRouter = Router();
tenantEvictionsRouter.use(requireAuth, requireRole('tenant'));
tenantEvictionsRouter.get('/', controller.getTenantNotices);
