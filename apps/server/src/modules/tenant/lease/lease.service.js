import Lease from '../../../shared/models/lease.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import { createNotification } from '../../../shared/services/notification.service.js';

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
    const leaseType = unit.leaseType || profile?.leaseType || (unit.leaseEnd || profile?.leaseEnd ? 'fixed_term' : 'indefinite');
    const leaseEnd = unit.leaseEnd || profile?.leaseEnd || (leaseType === 'indefinite' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

    const createdLease = await Lease.create({
      tenant: tenantId,
      landlord: landlordId,
      property: unit.property._id,
      unit: unit._id,
      leaseStart,
      leaseType,
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

  const daysRemaining = lease.leaseEnd
    ? Math.max(0, Math.ceil((new Date(lease.leaseEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const renewalWindowOpensAt = lease.leaseEnd ? new Date(new Date(lease.leaseEnd).getTime() - 60 * 24 * 60 * 60 * 1000) : null;
  const isRenewalWindowOpen = renewalWindowOpensAt ? Date.now() >= renewalWindowOpensAt.getTime() : false;

  return {
    ...lease,
    id: lease._id,
    unitLabel: lease.unit?.label || 'Unit N/A',
    propertyName: lease.property?.name || 'Property N/A',
    propertyAddress: lease.property?.address || '',
    daysRemaining,
    renewalWindowOpensAt: renewalWindowOpensAt?.toISOString().split('T')[0] || null,
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
  if (lease.leaseType === 'indefinite' || !lease.leaseEnd) throw new LeaseError('An indefinite lease does not need an extension.', 409);

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

export async function requestEarlyTermination(tenantId, { requestedMoveOutDate, reason } = {}, ipAddress = '') {
  const cleanReason = typeof reason === 'string' ? reason.trim() : '';
  if (!cleanReason || cleanReason.length > 2000) throw new LeaseError('Please provide a reason (up to 2,000 characters).', 400);
  const moveOutDate = new Date(requestedMoveOutDate);
  if (!requestedMoveOutDate || Number.isNaN(moveOutDate.getTime())) throw new LeaseError('Choose a valid requested move-out date.', 400);
  const lease = await Lease.findOne({ tenant: tenantId, status: { $in: ['active', 'renewal_pending', 'renewal_approved'] } }).populate('property', 'name').populate('unit', 'label');
  if (!lease) throw new LeaseError('No active lease was found for your account.', 404);
  if (moveOutDate <= new Date() || (lease.leaseEnd && moveOutDate >= new Date(lease.leaseEnd))) throw new LeaseError(lease.leaseEnd ? 'The requested date must be in the future and before the current lease end date.' : 'The requested date must be in the future.', 400);
  if (lease.terminationRequests.some((request) => request.status === 'pending')) throw new LeaseError('You already have an early lease termination request awaiting review.', 409);
  const request = { requestedMoveOutDate: moveOutDate, reason: cleanReason, status: 'pending', requestedAt: new Date() };
  lease.terminationRequests.push(request);
  await lease.save();
  await logAction({ actorId: tenantId, action: 'EARLY_LEASE_TERMINATION_REQUESTED', entityId: lease._id, afterState: request, ipAddress });
  await createNotification({ userId: lease.landlord, title: 'Early lease termination requested', body: `${lease.unit?.label || 'A tenant'} requested an early move-out date of ${moveOutDate.toLocaleDateString()}.`, type: 'lease', refModel: 'Lease', refId: lease._id });
  const created = lease.terminationRequests[lease.terminationRequests.length - 1];
  return { success: true, message: 'Your early lease termination request was sent to your landlord.', request: created, leaseId: lease._id };
}

/**
 * GET full lease data for PDF generation (includes populated names)
 */
export async function getLeaseDocument(tenantId) {
  const lease = await Lease.findOne({ tenant: tenantId, status: { $ne: 'ended' } })
    .populate('property')
    .populate('unit')
    .populate('tenant', 'firstName lastName email')
    .populate('landlord', 'firstName lastName email')
    .lean();

  if (!lease) {
    // Fallback — initialise lease first then re-query
    await getTenantLease(tenantId);
    const fallback = await Lease.findOne({ tenant: tenantId, status: { $ne: 'ended' } })
      .populate('property')
      .populate('unit')
      .populate('tenant', 'firstName lastName email')
      .populate('landlord', 'firstName lastName email')
      .lean();
    if (!fallback) throw new LeaseError('No active lease found', 404);
    return buildLeaseDocData(fallback);
  }

  return buildLeaseDocData(lease);
}

function buildLeaseDocData(lease) {
  const tenantName = lease.tenant
    ? `${lease.tenant.firstName || ''} ${lease.tenant.lastName || ''}`.trim() || lease.tenant.email
    : '—';
  const landlordName = lease.landlord
    ? `${lease.landlord.firstName || ''} ${lease.landlord.lastName || ''}`.trim() || lease.landlord.email
    : '—';

  return {
    id: lease._id,
    tenantName,
    landlordName,
    propertyName: lease.property?.name || 'Property N/A',
    propertyAddress: lease.property?.address || '',
    unitLabel: lease.unit?.label || 'Unit N/A',
    unitBedrooms: lease.unit?.bedrooms || null,
    unitBathrooms: lease.unit?.bathrooms || null,
    unitSqft: lease.unit?.sqft || null,
    leaseStart: lease.leaseStart,
    leaseType: lease.leaseType || (lease.leaseEnd ? 'fixed_term' : 'indefinite'),
    leaseEnd: lease.leaseEnd,
    monthlyRent: lease.monthlyRent,
    securityDeposit: lease.securityDeposit,
    hasParking: lease.hasParking,
    parkingSpot: lease.parkingSpot,
    parkingFee: lease.parkingFee,
    status: lease.status,
    covenants: lease.covenants,
    extensionRequests: lease.extensionRequests || [],
    contractPdfUrl: lease.contractPdfUrl,
  };
}
