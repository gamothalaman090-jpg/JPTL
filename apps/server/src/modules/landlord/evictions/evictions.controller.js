import asyncHandler from '../../../shared/middleware/asyncHandler.middleware.js';
import * as evictionService from './evictions.service.js';

export const getLandlordNotices = asyncHandler(async (req, res) => {
  const notices = await evictionService.listLandlordNotices(req.user._id || req.user.id);
  res.status(200).json({ success: true, notices });
});

export const createEvictionNotice = asyncHandler(async (req, res) => {
  const notice = await evictionService.createNotice(req.user._id || req.user.id, req.body, req.ip || '');
  res.status(201).json({ success: true, notice });
});

export const cancelEvictionNotice = asyncHandler(async (req, res) => {
  const notice = await evictionService.cancelNotice(req.user._id || req.user.id, req.params.noticeId, req.body, req.ip || '');
  res.status(200).json({ success: true, notice });
});

export const deleteCanceledNotice = asyncHandler(async (req, res) => {
  const result = await evictionService.deleteCanceledNotice(req.user._id || req.user.id, req.params.noticeId, req.ip || '');
  res.status(200).json({ success: true, ...result });
});

export const overrideEviction = asyncHandler(async (req, res) => {
  const result = await evictionService.overrideEviction(req.user._id || req.user.id, req.params.leaseId, req.body, req.ip || '');
  res.status(200).json({ success: true, ...result });
});

export const getTenantNotices = asyncHandler(async (req, res) => {
  const notices = await evictionService.listTenantNotices(req.user._id || req.user.id);
  res.status(200).json({ success: true, notices });
});
