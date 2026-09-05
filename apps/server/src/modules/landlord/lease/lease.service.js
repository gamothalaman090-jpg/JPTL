import Lease from '../../../shared/models/lease.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';

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
