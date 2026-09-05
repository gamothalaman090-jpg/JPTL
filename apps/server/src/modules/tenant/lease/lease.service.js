import Lease from '../../../shared/models/lease.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';

export class LeaseError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function logAction({ actorId, action, entityKind = 'Lease', entityId, beforeState = null, afterState = null, ipAddress = '' }) {
  try {
    await AuditLog.create({
      actor: actorId,
      actorRole: 'tenant',
      action,
      entityKind,
      entityId,
      beforeState,
      afterState,
      ipAddress,
    });
  } catch (err) {
    console.error('Lease AuditLog error:', err.message);
  }
}

/**
 * GET or initialize active lease for tenant
 */
export async function getTenantLease(tenantId) {
  let lease = await Lease.findOne({ tenant: tenantId, status: { $ne: 'ended' } })
    .populate('property')
    .populate('unit')
    .lean();

  if (!lease) {
    // If not in Lease collection yet, resolve from Unit & TenantProfile
    const unit = await Unit.findOne({ tenant: tenantId }).populate('property').lean();
    const profile = await TenantProfile.findOne({ user: tenantId }).lean();

    if (!unit) {
      throw new LeaseError('No active lease or unit assignment found for your tenant account', 404);
    }

    const landlordId = unit.property?.landlord || profile?.landlord;
    const monthlyRent = unit.monthlyRent || profile?.monthlyRent || 2000;
    const leaseStart = unit.leaseStart || new Date();
    const leaseEnd = unit.leaseEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const createdLease = await Lease.create({
      tenant: tenantId,
      landlord: landlordId,
      property: unit.property._id,
      unit: unit._id,
      leaseStart,
      leaseEnd,
      monthlyRent,
      securityDeposit: monthlyRent * 1.5,
      status: 'active',
      contractPdfUrl: '/docs/sample-lease-agreement.pdf',
    });

    lease = await Lease.findById(createdLease._id)
      .populate('property')
      .populate('unit')
      .lean();
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(lease.leaseEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const renewalWindowOpensAt = new Date(new Date(lease.leaseEnd).getTime() - 60 * 24 * 60 * 60 * 1000);
  const isRenewalWindowOpen = Date.now() >= renewalWindowOpensAt.getTime();

  return {
    ...lease,
    id: lease._id,
    unitLabel: lease.unit?.label || 'Unit N/A',
    propertyName: lease.property?.name || 'Property N/A',
    propertyAddress: lease.property?.address || '',
    daysRemaining,
    renewalWindowOpensAt: renewalWindowOpensAt.toISOString().split('T')[0],
    isRenewalWindowOpen,
  };
}

/**
 * SUBMIT lease extension / renewal request
 */
export async function requestLeaseExtension(tenantId, payload, ipAddress = '') {
  const { termMonths = 12, proposedStartDate, notes = '' } = payload;

  if (!termMonths || Number(termMonths) <= 0) {
    throw new LeaseError('Valid extension term (e.g. 6, 12, 24 months) is required', 400);
  }

  let lease = await Lease.findOne({ tenant: tenantId, status: { $ne: 'ended' } });
  if (!lease) {
    // Resolve lease
    await getTenantLease(tenantId);
    lease = await Lease.findOne({ tenant: tenantId, status: { $ne: 'ended' } });
  }

  if (!lease) {
    throw new LeaseError('No active lease found to extend', 404);
  }

  const startDate = proposedStartDate ? new Date(proposedStartDate) : new Date(lease.leaseEnd);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + Number(termMonths));

  const newExtensionRequest = {
    termMonths: Number(termMonths),
    proposedStartDate: startDate,
    proposedEndDate: endDate,
    monthlyRent: lease.monthlyRent,
    tenantNotes: notes.trim(),
    status: 'pending',
    requestedAt: new Date(),
  };

  lease.extensionRequests.push(newExtensionRequest);
  lease.status = 'renewal_pending';
  await lease.save();

  await logAction({
    actorId: tenantId,
    action: 'LEASE_EXTENSION_REQUESTED',
    entityId: lease._id,
    afterState: newExtensionRequest,
    ipAddress,
  });

  const createdRequest = lease.extensionRequests[lease.extensionRequests.length - 1];

  return {
    success: true,
    message: `Lease extension request for ${termMonths} months submitted successfully.`,
    extensionRequest: createdRequest,
    leaseStatus: lease.status,
  };
}

/**
 * GET digital lease agreement contract document details
 */
export async function getLeaseDocument(tenantId) {
  const lease = await getTenantLease(tenantId);

  return {
    contractPdfUrl: lease.contractPdfUrl || '/docs/sample-lease-agreement.pdf',
    documentTitle: `Signed Lease Agreement — ${lease.unitLabel}, ${lease.propertyName}`,
    leaseStart: lease.leaseStart,
    leaseEnd: lease.leaseEnd,
    monthlyRent: lease.monthlyRent,
    securityDeposit: lease.securityDeposit,
    covenants: lease.covenants,
  };
}
