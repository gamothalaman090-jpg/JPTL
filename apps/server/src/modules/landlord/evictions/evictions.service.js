import mongoose from 'mongoose';
import EvictionNotice from '../../../shared/models/evictionNotice.model.js';
import Lease from '../../../shared/models/lease.model.js';
import Unit from '../../../shared/models/unit.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import { createNotification } from '../../../shared/services/notification.service.js';

export class EvictionError extends Error {
  constructor(message, statusCode = 400) { super(message); this.statusCode = statusCode; }
}

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

function validateText(value, name, maxLength = 2000) {
  if (typeof value !== 'string' || !value.trim()) throw new EvictionError(`${name} is required`, 400);
  if (value.trim().length > maxLength) throw new EvictionError(`${name} must be ${maxLength} characters or fewer`, 400);
  return value.trim();
}

async function findManagedLease(landlordId, leaseId, { activeOnly = true } = {}) {
  if (!isObjectId(leaseId)) throw new EvictionError('Valid leaseId is required', 400);
  const filter = { _id: leaseId, landlord: landlordId };
  if (activeOnly) filter.status = { $ne: 'ended' };
  const lease = await Lease.findOne(filter).populate('property', 'landlord name address').populate('unit', 'label');
  if (!lease) throw new EvictionError('Active lease not found or access denied', 404);
  if (lease.property?.landlord && lease.property.landlord.toString() !== landlordId.toString()) {
    throw new EvictionError('Access denied', 403);
  }
  return lease;
}

export async function listLandlordNotices(landlordId) {
  return EvictionNotice.find({ landlord: landlordId })
    .populate('tenant', 'firstName lastName email')
    .populate('property', 'name address')
    .populate('unit', 'label')
    .sort({ createdAt: -1 }).lean();
}

export async function listTenantNotices(tenantId) {
  const notices = await EvictionNotice.find({ tenant: tenantId })
    .populate('property', 'name address')
    .populate('unit', 'label')
    .sort({ createdAt: -1 }).lean();
  const leases = await Lease.find({ tenant: tenantId }).populate('property', 'name address').populate('unit', 'label').lean();
  const requests = leases.flatMap((lease) => (lease.terminationRequests || []).map((request) => ({
    ...request,
    id: request._id,
    type: 'early_termination_request',
    leaseId: lease._id,
    property: lease.property,
    unit: lease.unit,
    requestedMoveOutDate: request.requestedMoveOutDate,
    issuedAt: request.requestedAt,
  })));
  return [...notices, ...requests].sort((a, b) => new Date(b.createdAt || b.issuedAt || 0) - new Date(a.createdAt || a.issuedAt || 0));
}

export async function createNotice(landlordId, { leaseId, reason, documentUrl = '', issuedAt } = {}, ipAddress = '') {
  const cleanReason = validateText(reason, 'Reason');
  if (documentUrl && (typeof documentUrl !== 'string' || documentUrl.length > 2048)) {
    throw new EvictionError('Document URL must be a valid URL no longer than 2048 characters', 400);
  }
  const lease = await findManagedLease(landlordId, leaseId);
  const issueDate = issuedAt ? new Date(issuedAt) : new Date();
  if (Number.isNaN(issueDate.getTime())) throw new EvictionError('issuedAt must be a valid date', 400);
  issueDate.setUTCHours(0, 0, 0, 0);
  const moveOutDate = new Date(issueDate);
  moveOutDate.setUTCDate(moveOutDate.getUTCDate() + 40);

  const notice = await EvictionNotice.create({
    lease: lease._id, tenant: lease.tenant, landlord: landlordId,
    property: lease.property?._id || lease.property, unit: lease.unit?._id || lease.unit,
    reason: cleanReason, issuedAt: issueDate, moveOutDate, noticePeriodDays: 40, documentUrl,
  });
  await AuditLog.create({ actor: landlordId, actorRole: 'landlord', action: 'EVICTION_NOTICE_ISSUED', entityKind: 'EvictionNotice', entityId: notice._id, ipAddress });
  await createNotification({ userId: lease.tenant, title: 'Eviction notice received', body: `A 40-day notice has been issued for ${lease.property?.name || 'your property'}.`, type: 'system', refModel: 'EvictionNotice', refId: notice._id });
  return EvictionNotice.findById(notice._id).populate('tenant', 'firstName lastName email').populate('property', 'name address').populate('unit', 'label').lean();
}

export async function cancelNotice(landlordId, noticeId, { reason = '' } = {}, ipAddress = '') {
  if (!isObjectId(noticeId)) throw new EvictionError('Valid noticeId is required', 400);
  if (typeof reason !== 'string' || reason.trim().length > 1000) throw new EvictionError('Cancellation reason must be 1000 characters or fewer', 400);
  const notice = await EvictionNotice.findOne({ _id: noticeId, landlord: landlordId });
  if (!notice) throw new EvictionError('Eviction notice not found or access denied', 404);
  if (notice.status !== 'active') throw new EvictionError('Only an active eviction notice can be canceled', 409);
  const now = new Date();
  notice.status = 'canceled';
  notice.canceledAt = now;
  notice.canceledBy = landlordId;
  notice.cancellationReason = reason.trim();
  await notice.save();
  await AuditLog.create({ actor: landlordId, actorRole: 'landlord', action: 'EVICTION_NOTICE_CANCELED', entityKind: 'EvictionNotice', entityId: notice._id, ipAddress });
  await createNotification({ userId: notice.tenant, title: 'Eviction notice canceled', body: 'Your landlord canceled the 40-day eviction notice.', type: 'system', refModel: 'EvictionNotice', refId: notice._id });
  return EvictionNotice.findById(notice._id).populate('tenant', 'firstName lastName email').populate('property', 'name address').populate('unit', 'label').lean();
}

export async function deleteCanceledNotice(landlordId, noticeId, ipAddress = '') {
  if (!isObjectId(noticeId)) throw new EvictionError('Valid noticeId is required', 400);
  const notice = await EvictionNotice.findOne({ _id: noticeId, landlord: landlordId });
  if (!notice) throw new EvictionError('Eviction notice not found or access denied', 404);
  if (notice.status !== 'canceled') throw new EvictionError('Only canceled eviction notices can be deleted', 409);
  await AuditLog.create({ actor: landlordId, actorRole: 'landlord', action: 'CANCELED_EVICTION_NOTICE_DELETED', entityKind: 'EvictionNotice', entityId: notice._id, ipAddress });
  await EvictionNotice.deleteOne({ _id: notice._id, landlord: landlordId, status: 'canceled' });
  return { noticeId: notice._id, deleted: true };
}

export async function overrideEviction(landlordId, leaseId, { reason } = {}, ipAddress = '') {
  const cleanReason = validateText(reason, 'Override reason', 1000);
  const lease = await findManagedLease(landlordId, leaseId);
  const beforeState = { status: lease.status, unit: lease.unit?._id || lease.unit, tenant: lease.tenant };
  lease.status = 'ended';
  await lease.save();

  const unitId = lease.unit?._id || lease.unit;
  if (unitId) await Unit.findByIdAndUpdate(unitId, { $set: { status: 'vacant', tenant: null, leaseStart: null, leaseType: 'fixed_term', leaseEnd: null } });
  await TenantProfile.findOneAndUpdate({ user: lease.tenant, unit: unitId }, { $set: { status: 'evicted', property: null, unit: null, monthlyRent: 0, leaseStart: null, leaseType: 'fixed_term', leaseEnd: null } });
  const overriddenAt = new Date();
  await EvictionNotice.updateMany({ lease: lease._id, status: 'active' }, { $set: { status: 'overridden', overriddenAt, overrideReason: cleanReason } });
  await AuditLog.create({ actor: landlordId, actorRole: 'landlord', action: 'EVICT_OVERRIDE', entityKind: 'Lease', entityId: lease._id, ipAddress });
  await createNotification({ userId: lease.tenant, title: 'Property assignment ended', body: 'Your lease and property assignment have been ended by the landlord.', type: 'system', refModel: 'Lease', refId: lease._id });
  return { leaseId: lease._id, status: 'ended', unitId, unitStatus: 'vacant', overriddenAt };
}
