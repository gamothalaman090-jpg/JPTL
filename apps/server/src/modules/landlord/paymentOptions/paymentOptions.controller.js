import asyncHandler from '../../../shared/middleware/asyncHandler.middleware.js';
import * as service from './paymentOptions.service.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, options: await service.listPaymentOptions(req.user.id || req.user._id) });
});

export const create = asyncHandler(async (req, res) => {
  const option = await service.createPaymentOption(req.user.id || req.user._id, req.body, req.file, req.ip || '');
  res.status(201).json({ success: true, option });
});

export const update = asyncHandler(async (req, res) => {
  const option = await service.updatePaymentOption(req.user.id || req.user._id, req.params.id, req.body, req.file, req.ip || '');
  res.json({ success: true, option });
});

export const setActive = asyncHandler(async (req, res) => {
  if (typeof req.body.isActive !== 'boolean') return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
  const option = await service.setPaymentOptionActive(req.user.id || req.user._id, req.params.id, req.body.isActive, req.ip || '');
  res.json({ success: true, option });
});
