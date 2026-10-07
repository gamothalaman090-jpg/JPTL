import mongoose from 'mongoose';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import User from '../../../shared/models/user.model.js';
import Payment from '../../../shared/models/payment.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';

class RentRollError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Helper to get all unit IDs belonging to a landlord
 */
async function getLandlordUnitIds(landlordId) {
  const properties = await Property.find({ landlord: landlordId }).select('_id').lean();
  const propertyIds = properties.map((p) => p._id);
  const units = await Unit.find({ property: { $in: propertyIds } }).select('_id property label monthlyRent tenant').lean();
  return { propertyIds, units, unitIds: units.map((u) => u._id) };
}

function visiblePaymentScope(unitIds, propertyIds) {
  return { $and: [
    { $or: [{ unit: { $in: unitIds } }, { property: { $in: propertyIds } }] },
    { status: { $ne: 'draft' } },
    { $or: [{ isAdvancePayment: { $ne: true } }, { status: 'paid' }, { submittedAt: { $ne: null } }] },
  ] };
}

/**
 * Format a single payment object for client response
 */
function formatPayment(p) {
  const tenantObj = p.tenant || null;
  const unitObj = p.unit || null;
  const propObj = p.property || unitObj?.property || null;

  const tenantName = tenantObj
    ? [tenantObj.firstName, tenantObj.middleName, tenantObj.lastName].filter(Boolean).join(' ')
    : 'Unknown Tenant';

  const propertyName = typeof propObj === 'object' && propObj?.name
    ? propObj.name
    : 'Unknown Property';

  const unitLabel = typeof unitObj === 'object' && unitObj?.label
    ? unitObj.label
    : 'Unknown Unit';

  return {
    id: p._id,
    paymentId: p._id,
    amount: p.amount,
    baseRent: p.baseRent ?? p.amount,
    parkingFee: p.parkingFee ?? 0,
    utilityFee: p.utilityFee ?? 0,
    processingFee: p.processingFee ?? 0,
    dueDate: p.dueDate,
    status: p.status,
    reviewStatus: p.reviewStatus || null,
    paymentChannel: p.paymentChannel || null,
    submittedAt: p.submittedAt || null,
    transferReference: p.transferReference || '',
    tenantPaymentNote: p.tenantPaymentNote || '',
    rejectionReason: p.rejectionReason || '',
    hasReceipt: Boolean(p.receiptPublicId),
    period: p.period || `Rent Due ${p.dueDate ? new Date(p.dueDate).toISOString().slice(0, 7) : 'Current'}`,
    paymentMethod: p.paymentMethod || null,
    mockTransactionId: p.mockTransactionId || null,
    paidAt: p.paidAt || null,
    notes: p.notes || '',
    tenant: tenantObj
      ? {
          id: tenantObj._id,
          firstName: tenantObj.firstName,
          lastName: tenantObj.lastName,
          name: tenantName,
          email: tenantObj.email,
          phone: tenantObj.phone || '',
        }
      : null,
    tenantName,
    tenantEmail: tenantObj?.email || '',
    unit: unitObj
      ? {
          id: unitObj._id,
          label: unitObj.label,
          monthlyRent: unitObj.monthlyRent,
        }
      : null,
    unitLabel,
    property: propObj
      ? {
          id: propObj._id,
          name: propertyName,
          address: propObj.address || '',
          city: propObj.city || '',
        }
      : null,
    propertyName,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/**
 * GET /api/landlord/rentroll
 * Query rent roll with search, status filters, property/unit filters, and summary metrics.
 */
export async function getRentRoll(landlordId, query = {}, context = {}) {
  const { propertyIds, unitIds, units } = (context.propertyIds && context.unitIds && context.units)
    ? context
    : await getLandlordUnitIds(landlordId);

  if (!unitIds.length) {
    return {
      summary: {
        totalCollected: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalExpected: 0,
        totalCount: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
        collectionRate: 0,
      },
      payments: [],
    };
  }

  // Base match filter scoped to landlord's units and properties
  const baseLandlordScope = visiblePaymentScope(unitIds, propertyIds);

  const filter = { $and: [...baseLandlordScope.$and] };

  // Status filter ('all', 'paid', 'pending', 'overdue', 'failed')
  if (query.status && query.status !== 'all') {
    if (query.status === 'pending_review') filter.$and.push({ reviewStatus: 'pending_review' });
    else filter.$and.push({ status: query.status });
  }

  // Specific property filter
  if (query.propertyId) {
    filter.$and.push({ property: query.propertyId });
  }

  // Specific unit filter
  if (query.unitId) {
    filter.$and.push({ unit: query.unitId });
  }

  // Date range filter on dueDate
  if (query.startDate || query.endDate) {
    filter.dueDate = {};
    if (query.startDate) filter.dueDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.dueDate.$lte = new Date(query.endDate);
  }

  // Fetch all payments for this landlord to compute summary metrics
  const [allLandlordPayments, matchedPayments] = await Promise.all([
    Payment.find(baseLandlordScope).lean(),
    Payment.find(filter)
      .populate('tenant', 'firstName middleName lastName email phone')
      .populate({
        path: 'unit',
        select: 'label property monthlyRent',
        populate: { path: 'property', select: 'name address city' },
      })
      .populate('property', 'name address city')
      .sort({ dueDate: -1, createdAt: -1 })
      .lean(),
  ]);

  // Compute summary on all landlord payments
  const totalCollected = allLandlordPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPending = allLandlordPayments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalOverdue = allLandlordPayments
    .filter((p) => p.status === 'overdue')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalExpected = allLandlordPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidCount = allLandlordPayments.filter((p) => p.status === 'paid').length;
  const pendingCount = allLandlordPayments.filter((p) => p.status === 'pending').length;
  const overdueCount = allLandlordPayments.filter((p) => p.status === 'overdue').length;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Format matched payments
  let formatted = matchedPayments.map(formatPayment);

  // Apply search query filter (in memory across tenant name, email, property name, unit label, transaction ID)
  if (query.search && query.search.trim()) {
    const q = query.search.trim().toLowerCase();
    formatted = formatted.filter((p) => {
      return (
        p.tenantName.toLowerCase().includes(q) ||
        p.tenantEmail.toLowerCase().includes(q) ||
        p.propertyName.toLowerCase().includes(q) ||
        p.unitLabel.toLowerCase().includes(q) ||
        (p.mockTransactionId && p.mockTransactionId.toLowerCase().includes(q)) ||
        (p.period && p.period.toLowerCase().includes(q))
      );
    });
  }

  return {
    summary: {
      totalCollected,
      totalPending,
      totalOverdue,
      totalExpected,
      totalCount: allLandlordPayments.length,
      paidCount,
      pendingCount,
      overdueCount,
      collectionRate,
    },
    payments: formatted,
  };
}

/**
 * GET /api/landlord/rentroll/kpi
 * Quick financial summary KPI snapshot for rent roll
 */
export async function getRentRollKpi(landlordId) {
  const result = await getRentRoll(landlordId, {});
  return result.summary;
}

/**
 * GET /api/landlord/rentroll/:id
 * Retrieve a single payment invoice detail
 */
export async function getPaymentById(landlordId, paymentId) {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new RentRollError('Invalid payment ID format', 400);
  }

  const { propertyIds, unitIds } = await getLandlordUnitIds(landlordId);

  const payment = await Payment.findOne({ _id: paymentId, ...visiblePaymentScope(unitIds, propertyIds) })
    .populate('tenant', 'firstName middleName lastName email phone')
    .populate({
      path: 'unit',
      select: 'label property monthlyRent bedrooms bathrooms sqft',
      populate: { path: 'property', select: 'name address city image' },
    })
    .populate('property', 'name address city image')
    .lean();

  if (!payment) {
    throw new RentRollError('Payment record not found or access denied', 404);
  }

  return formatPayment(payment);
}

/**
 * POST /api/landlord/rentroll
 * Create a new payment invoice / charge for a tenant
 */
export async function createPaymentInvoice(landlordId, data, ipAddress = '') {
  const { unitId, tenantId, amount, dueDate, period, baseRent, parkingFee, utilityFee, notes, status } = data;

  if (!unitId || !mongoose.Types.ObjectId.isValid(unitId)) {
    throw new RentRollError('Valid unitId is required', 400);
  }
  if (status === 'draft') throw new RentRollError('Draft invoices are reserved for tenant advance payment preparation.', 400);
  if (status === 'paid') throw new RentRollError('Invoices must be approved through payment review before they can be marked paid', 400);

  // Validate unit belongs to landlord
  const unit = await Unit.findById(unitId).populate('property').lean();
  if (!unit || unit.property.landlord.toString() !== landlordId.toString()) {
    throw new RentRollError('Unit does not belong to your managed properties', 403);
  }

  // Resolve tenant
  let targetTenantId = tenantId;
  if (!targetTenantId) {
    if (!unit.tenant) {
      throw new RentRollError('No tenant is assigned to this unit. Provide tenantId explicitly', 400);
    }
    targetTenantId = unit.tenant;
  }

  const tenant = await User.findById(targetTenantId).lean();
  if (!tenant) {
    throw new RentRollError('Tenant user record not found', 404);
  }

  const calculatedBase = baseRent !== undefined ? Number(baseRent) : (unit.monthlyRent || 0);
  const calculatedParking = parkingFee !== undefined ? Number(parkingFee) : 0;
  const calculatedUtility = utilityFee !== undefined ? Number(utilityFee) : 0;
  const totalAmount = amount !== undefined ? Number(amount) : calculatedBase + calculatedParking + calculatedUtility;

  if (isNaN(totalAmount) || totalAmount <= 0) {
    throw new RentRollError('Amount must be a positive number', 400);
  }

  const parsedDueDate = dueDate ? new Date(dueDate) : new Date();
  if (isNaN(parsedDueDate.getTime())) {
    throw new RentRollError('Invalid dueDate format', 400);
  }

  const payment = new Payment({
    tenant: targetTenantId,
    unit: unitId,
    property: unit.property._id,
    amount: totalAmount,
    baseRent: calculatedBase,
    parkingFee: calculatedParking,
    utilityFee: calculatedUtility,
    dueDate: parsedDueDate,
    status: status || 'pending',
    period: period || `Rent Due ${parsedDueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
    notes: notes || '',
  });

  await payment.save();

  // Audit log
  await AuditLog.create({
    actor: landlordId,
    actorRole: 'landlord',
    action: 'PAYMENT_INVOICE_CREATED',
    entityKind: 'Payment',
    entityId: payment._id,
    ipAddress,
  });

  return getPaymentById(landlordId, payment._id);
}

/**
 * PATCH /api/landlord/rentroll/:id/mark-paid
 * Mark a payment invoice as paid (used by "Mark Paid" button in PaymentsTab)
 */
export async function markPaymentAsPaid(landlordId, paymentId, data = {}, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new RentRollError('Invalid payment ID format', 400);
  }

  const { propertyIds, unitIds } = await getLandlordUnitIds(landlordId);

  const payment = await Payment.findOne({ _id: paymentId, ...visiblePaymentScope(unitIds, propertyIds) });
  if (!payment) {
    throw new RentRollError('Payment record not found or access denied', 404);
  }

  if (payment.reviewStatus !== 'pending_review' || payment.paymentChannel !== 'onsite') {
    throw new RentRollError('Only an onsite payment awaiting review can be confirmed here', 409);
  }
  return reviewPayment(landlordId, paymentId, { action: 'approve', notes: data.notes }, ipAddress);
}

export async function reviewPayment(landlordId, paymentId, data = {}, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) throw new RentRollError('Invalid payment ID format', 400);
  const action = data.action;
  if (!['approve', 'reject'].includes(action)) throw new RentRollError('Action must be approve or reject', 400);
  const { propertyIds, unitIds } = await getLandlordUnitIds(landlordId);
  const payment = await Payment.findOne({ _id: paymentId, ...visiblePaymentScope(unitIds, propertyIds) });
  if (!payment) throw new RentRollError('Payment record not found or access denied', 404);
  if (payment.reviewStatus !== 'pending_review') throw new RentRollError('Payment is not awaiting review', 409);
  if (action === 'approve' && payment.paymentChannel !== 'onsite' && !payment.receiptPublicId) throw new RentRollError('Transfer receipt is required before approval', 409);
  if (action === 'reject' && !String(data.reason || '').trim()) throw new RentRollError('A rejection reason is required', 400);

  payment.reviewStatus = action === 'approve' ? 'approved' : 'rejected';
  payment.reviewedAt = new Date();
  payment.reviewedBy = landlordId;
  if (action === 'approve') {
    payment.status = 'paid';
    payment.paidAt = payment.reviewedAt;
    payment.receiptNumber = payment.receiptNumber || `RCP-${payment._id.toString().slice(-8).toUpperCase()}`;
    payment.rejectionReason = '';
    payment.paymentMethod = payment.paymentOptionSnapshot?.displayName || (payment.paymentChannel === 'onsite' ? 'Pay Onsite' : 'Bank Transfer');
  } else {
    payment.rejectionReason = String(data.reason).trim().slice(0, 1000);
  }
  if (data.notes) payment.notes = String(data.notes).trim().slice(0, 1000);
  await payment.save();
  await AuditLog.create({ actor: landlordId, actorRole: 'landlord', action: action === 'approve' ? 'PAYMENT_REVIEW_APPROVED' : 'PAYMENT_REVIEW_REJECTED', entityKind: 'Payment', entityId: payment._id, afterState: { reviewStatus: payment.reviewStatus, reason: payment.rejectionReason }, ipAddress });
  if (payment.tenant) {
    const { createNotification } = await import('../../../shared/services/notification.service.js');
    await createNotification({ userId: payment.tenant, title: action === 'approve' ? 'Payment approved' : 'Payment needs attention', body: action === 'approve' ? `Your payment for ${payment.period || 'rent'} was approved.` : `Your payment for ${payment.period || 'rent'} was declined: ${payment.rejectionReason}`, type: 'payment', refModel: 'Payment', refId: payment._id });
  }
  return getPaymentById(landlordId, payment._id);
}

export async function getLandlordPaymentEvidence(landlordId, paymentId) {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) throw new RentRollError('Invalid payment ID format', 400);
  const { propertyIds, unitIds } = await getLandlordUnitIds(landlordId);
  const payment = await Payment.findOne({ _id: paymentId, ...visiblePaymentScope(unitIds, propertyIds) }).lean();
  if (!payment?.receiptPublicId) throw new RentRollError('Payment evidence not found', 404);
  const { getPrivatePaymentAssetUrl } = await import('../../../shared/config/cloudinary.js');
  const format = payment.receiptFormat;
  const url = await getPrivatePaymentAssetUrl(payment.receiptPublicId, format, format === 'pdf' ? 'raw' : 'image');
  if (!url) throw new RentRollError('Payment evidence storage is unavailable', 404);
  const response = await fetch(url);
  if (!response.ok) throw new RentRollError('Payment evidence could not be loaded', 502);
  return { stream: response.body, name: payment.receiptOriginalName || 'payment-receipt', mimeType: response.headers.get('content-type') || 'application/octet-stream' };
}

/**
 * PUT /api/landlord/rentroll/:id
 * Update an existing payment record
 */
export async function updatePayment(landlordId, paymentId, data = {}, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new RentRollError('Invalid payment ID format', 400);
  }

  const { propertyIds, unitIds } = await getLandlordUnitIds(landlordId);

  const payment = await Payment.findOne({ _id: paymentId, ...visiblePaymentScope(unitIds, propertyIds) });
  if (!payment) {
    throw new RentRollError('Payment record not found or access denied', 404);
  }

  if (data.amount !== undefined) {
    const amt = Number(data.amount);
    if (isNaN(amt) || amt <= 0) throw new RentRollError('Amount must be a positive number', 400);
    payment.amount = amt;
  }

  if (data.dueDate !== undefined) {
    const d = new Date(data.dueDate);
    if (isNaN(d.getTime())) throw new RentRollError('Invalid dueDate format', 400);
    payment.dueDate = d;
  }

  if (data.status !== undefined) {
    const validStatuses = ['pending', 'paid', 'overdue', 'failed'];
    if (!validStatuses.includes(data.status)) {
      throw new RentRollError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
    }
    if (data.status === 'paid' && payment.status !== 'paid') throw new RentRollError('Use payment review to approve a submitted payment', 409);
    payment.status = data.status;
  }

  if (data.period !== undefined) payment.period = data.period;
  if (data.paymentMethod !== undefined) payment.paymentMethod = data.paymentMethod;
  if (data.notes !== undefined) payment.notes = data.notes;
  if (data.baseRent !== undefined) payment.baseRent = Number(data.baseRent);
  if (data.parkingFee !== undefined) payment.parkingFee = Number(data.parkingFee);
  if (data.utilityFee !== undefined) payment.utilityFee = Number(data.utilityFee);

  await payment.save();

  // Audit log
  await AuditLog.create({
    actor: landlordId,
    actorRole: 'landlord',
    action: 'PAYMENT_UPDATED',
    entityKind: 'Payment',
    entityId: payment._id,
    ipAddress,
  });

  return getPaymentById(landlordId, payment._id);
}

/**
 * DELETE /api/landlord/rentroll/:id
 * Delete / void a payment record
 */
export async function deletePayment(landlordId, paymentId, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new RentRollError('Invalid payment ID format', 400);
  }

  const { propertyIds, unitIds } = await getLandlordUnitIds(landlordId);

  const payment = await Payment.findOne({ _id: paymentId, ...visiblePaymentScope(unitIds, propertyIds) });
  if (!payment) {
    throw new RentRollError('Payment record not found or access denied', 404);
  }

  await Payment.deleteOne({ _id: paymentId });

  // Audit log
  await AuditLog.create({
    actor: landlordId,
    actorRole: 'landlord',
    action: 'PAYMENT_DELETED',
    entityKind: 'Payment',
    entityId: payment._id,
    ipAddress,
  });

  return { message: 'Payment record deleted successfully' };
}

/**
 * GET /api/landlord/rentroll/export
 * Export rent roll data as CSV formatted text or JSON
 */
export async function exportRentRoll(landlordId, query = {}) {
  const result = await getRentRoll(landlordId, query);
  const rows = result.payments;

  // Generate CSV text
  const headers = ['Transaction ID', 'Tenant Name', 'Tenant Email', 'Property', 'Unit', 'Period', 'Amount', 'Due Date', 'Status', 'Paid At', 'Payment Method'];
  const csvLines = [headers.join(',')];

  for (const r of rows) {
    const line = [
      `"${r.mockTransactionId || r.id}"`,
      `"${r.tenantName}"`,
      `"${r.tenantEmail}"`,
      `"${r.propertyName}"`,
      `"${r.unitLabel}"`,
      `"${r.period}"`,
      `"${r.amount}"`,
      `"${r.dueDate ? new Date(r.dueDate).toISOString().slice(0, 10) : ''}"`,
      `"${r.status}"`,
      `"${r.paidAt ? new Date(r.paidAt).toISOString() : ''}"`,
      `"${r.paymentMethod || ''}"`,
    ];
    csvLines.push(line.join(','));
  }

  return {
    filename: `Rent_Roll_Export_${new Date().toISOString().slice(0, 10)}.csv`,
    csv: csvLines.join('\n'),
    count: rows.length,
    data: rows,
    summary: result.summary,
  };
}
