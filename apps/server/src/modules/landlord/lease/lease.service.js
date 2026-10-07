import Lease from '../../../shared/models/lease.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import { createNotification } from '../../../shared/services/notification.service.js';

export class LandlordLeaseError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function logAction({ actorId, action, entityKind = 'Lease', entityId, beforeState = null, afterState = null, ipAddress = '' }) {
  try {
    await AuditLog.create({
      actor: actorId,
      actorRole: 'landlord',
      action,
      entityKind,
      entityId,
      beforeState,
      afterState,
      ipAddress,
    });
  } catch (err) {
    console.error('Landlord Lease AuditLog error:', err.message);
  }
}

/**
 * GET all pending or active lease extension requests for landlord
 */
export async function getLandlordLeasesAndExtensions(landlordId) {
  const landlordProperties = await Property.find({ landlord: landlordId }).select('_id name address').lean();
  const propertyIds = landlordProperties.map((p) => p._id);

  const leases = await Lease.find({ property: { $in: propertyIds } })
    .populate('tenant', 'firstName lastName email phone')
    .populate('unit', 'label monthlyRent')
    .populate('property', 'name address')
    .sort({ updatedAt: -1 })
    .lean();

  const allExtensionRequests = [];
  leases.forEach((l) => {
    if (l.extensionRequests && l.extensionRequests.length > 0) {
      l.extensionRequests.forEach((req) => {
        allExtensionRequests.push({
          ...req,
          requestId: req._id,
          leaseId: l._id,
          tenantName: l.tenant ? `${l.tenant.firstName} ${l.tenant.lastName}`.trim() || l.tenant.email : 'Tenant',
          tenantEmail: l.tenant?.email || '',
          unitLabel: l.unit?.label || 'Unit',
          propertyName: l.property?.name || 'Property',
          currentLeaseEnd: l.leaseEnd,
          currentMonthlyRent: l.monthlyRent,
        });
      });
    }
  });

  return {
    leases: leases.map((l) => ({ ...l, id: l._id })),
    extensionRequests: allExtensionRequests,
    pendingExtensionsCount: allExtensionRequests.filter((r) => r.status === 'pending').length,
  };
}

/**
 * REVIEW (Approve or Reject) a lease extension request
 */
export async function reviewLeaseExtension(landlordId, leaseId, requestId, { status, landlordNotes = '' }, ipAddress = '') {
  if (!['approved', 'rejected'].includes(status)) {
    throw new LandlordLeaseError('Status must be either "approved" or "rejected"', 400);
  }

  const lease = await Lease.findById(leaseId).populate('unit').populate('property');
  if (!lease) throw new LandlordLeaseError('Lease agreement not found', 404);

  if (lease.property?.landlord?.toString() !== landlordId.toString() && lease.landlord?.toString() !== landlordId.toString()) {
    throw new LandlordLeaseError('Access denied', 403);
  }

  const extRequest = lease.extensionRequests.id(requestId);
  if (!extRequest) {
    throw new LandlordLeaseError('Extension request not found on this lease', 404);
  }

  const beforeState = lease.toObject();

  extRequest.status = status;
  extRequest.landlordNotes = landlordNotes.trim();
  extRequest.reviewedAt = new Date();
  extRequest.reviewedBy = landlordId;

  if (status === 'approved') {
    lease.status = 'renewal_approved';
    lease.leaseEnd = extRequest.proposedEndDate;
    // Also update Unit leaseEnd
    await Unit.findByIdAndUpdate(lease.unit._id, { leaseEnd: extRequest.proposedEndDate });
  } else {
    lease.status = 'active';
  }

  await lease.save();

  await logAction({
    actorId: landlordId,
    action: status === 'approved' ? 'LEASE_EXTENSION_APPROVED' : 'LEASE_EXTENSION_REJECTED',
    entityId: lease._id,
    beforeState,
    afterState: lease.toObject(),
    ipAddress,
  });

  return {
    success: true,
    message: `Lease extension request ${status} successfully.`,
    lease: { ...lease.toObject(), id: lease._id },
  };
}

export async function reviewEarlyTermination(landlordId, leaseId, requestId, { status, landlordNotes = '' } = {}, ipAddress = '') {
  if (!['approved', 'rejected'].includes(status)) throw new LandlordLeaseError('Status must be approved or rejected.', 400);
  const lease = await Lease.findOne({ _id: leaseId, landlord: landlordId }).populate('property', 'landlord name').populate('unit', 'label');
  if (!lease) throw new LandlordLeaseError('Lease not found or access denied.', 404);
  const request = lease.terminationRequests.id(requestId);
  if (!request) throw new LandlordLeaseError('Early termination request not found.', 404);
  if (request.status !== 'pending') throw new LandlordLeaseError('This request has already been reviewed.', 409);
  if (typeof landlordNotes !== 'string' || landlordNotes.trim().length > 1000) throw new LandlordLeaseError('Landlord note must be 1,000 characters or fewer.', 400);
  request.status = status;
  request.landlordNotes = landlordNotes.trim();
  request.reviewedAt = new Date();
  request.reviewedBy = landlordId;
  if (status === 'approved') {
    lease.leaseEnd = request.requestedMoveOutDate;
    lease.leaseType = 'fixed_term';
    lease.status = 'active';
    await Unit.findByIdAndUpdate(lease.unit?._id || lease.unit, { $set: { leaseType: 'fixed_term', leaseEnd: request.requestedMoveOutDate } });
    await TenantProfile.findOneAndUpdate({ user: lease.tenant }, { $set: { leaseType: 'fixed_term', leaseEnd: request.requestedMoveOutDate } });
  }
  await lease.save();
  await logAction({ actorId: landlordId, action: status === 'approved' ? 'EARLY_LEASE_TERMINATION_APPROVED' : 'EARLY_LEASE_TERMINATION_REJECTED', entityId: lease._id, afterState: { requestId, status, requestedMoveOutDate: request.requestedMoveOutDate, landlordNotes: request.landlordNotes }, ipAddress });
  await createNotification({ userId: lease.tenant, title: status === 'approved' ? 'Early lease end approved' : 'Early lease end request declined', body: status === 'approved' ? `Your landlord approved an early lease end date of ${new Date(request.requestedMoveOutDate).toLocaleDateString()}.` : `Your early lease termination request was declined.${request.landlordNotes ? ` Note: ${request.landlordNotes}` : ''}`, type: 'lease', refModel: 'Lease', refId: lease._id });
  return { success: true, message: `Early termination request ${status}.`, lease: { ...lease.toObject(), id: lease._id } };
}
