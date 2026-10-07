import mongoose from 'mongoose';
import User from '../../../shared/models/user.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import Payment from '../../../shared/models/payment.model.js';
import Lease from '../../../shared/models/lease.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import PaymentOption from '../../../shared/models/paymentOption.model.js';
import { createNotification } from '../../../shared/services/notification.service.js';
import { uploadPaymentAssetToCloudinary, getPrivatePaymentAssetUrl } from '../../../shared/config/cloudinary.js';

class TenantPaymentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const isValidReceiptFile = (file) => {
  if (!file?.buffer) return false;
  const b = file.buffer;
  const png = b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const webp = b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
  const pdf = b.length >= 5 && b.toString('ascii', 0, 5) === '%PDF-';
  return png || jpeg || webp || pdf;
};

function assertSubmittable(payment) {
  if (!payment) throw new TenantPaymentError('Invoice not found or access denied', 404);
  if (payment.status === 'paid') throw new TenantPaymentError('This invoice has already been paid', 409);
  if (payment.status === 'draft' && payment.isAdvancePayment) return;
  if (!['pending', 'overdue'].includes(payment.status)) throw new TenantPaymentError('Only pending or overdue rent invoices can receive a payment submission', 409);
  if (payment.reviewStatus === 'pending_review') throw new TenantPaymentError('This payment is already waiting for landlord review', 409);
}

async function notifyPaymentSubmitted(payment) {
  const property = payment.property ? await Property.findById(payment.property).select('landlord name').lean() : null;
  const landlordId = property?.landlord;
  if (landlordId) await createNotification({ userId: landlordId, title: 'Payment awaiting review', body: `A tenant submitted a ${payment.paymentChannel?.replace('_', ' ')} payment for ${payment.period || 'an invoice'}.`, type: 'payment', refModel: 'Payment', refId: payment._id });
}

/**
 * Resolve tenant profile, unit, and property
 */
async function resolveTenantContext(tenantId) {
  const [userDoc, profile] = await Promise.all([
    User.findById(tenantId).lean(),
    TenantProfile.findOne({ user: tenantId })
      .populate('unit')
      .populate('property')
      .lean(),
  ]);

  if (!userDoc) {
    throw new TenantPaymentError('Tenant user account not found', 404);
  }

  return { userDoc, profile, unit: profile?.unit || null, property: profile?.property || null };
}

/**
 * GET /api/tenant/payments
 * Get complete tenant ledger, itemized monthly statement, autoPay settings, and payment history.
 */
export async function getTenantLedger(tenantId) {
  const { userDoc, profile, unit, property } = await resolveTenantContext(tenantId);

  const rentAmount = profile?.monthlyRent || unit?.monthlyRent || 2400;
  const hasParking = Boolean(profile?.hasParking ?? unit?.hasParking ?? false);
  const parkingSpot = hasParking ? (profile?.parkingSpot || unit?.parkingSpot || 'Assigned Space') : null;
  const parkingFee = hasParking ? Number(profile?.parkingFee ?? unit?.parkingFee ?? 0) : 0;
  const utilityFee = 45;
  const totalMonthlyDue = rentAmount + parkingFee + utilityFee;

  // Query tenant payments
  const payments = await Payment.find({ tenant: tenantId })
    .populate('unit', 'label')
    .populate('property', 'name address city')
    .sort({ dueDate: -1, createdAt: -1 })
    .lean();

  // Find upcoming pending or overdue invoice
  const now = new Date();
  const upcomingInvoice = payments.find(
    (p) => p.status === 'pending' || p.status === 'overdue'
  );

  const nextDueDate = upcomingInvoice
    ? upcomingInvoice.dueDate
    : new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const currentStatement = {
    statementMonth: nextDueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    dueDate: nextDueDate,
    status: upcomingInvoice?.status || 'pending',
    baseRent: upcomingInvoice?.baseRent || rentAmount,
    hasParking,
    parkingSpot,
    parkingFee: upcomingInvoice?.parkingFee !== undefined ? upcomingInvoice.parkingFee : parkingFee,
    utilityFee: upcomingInvoice?.utilityFee !== undefined ? upcomingInvoice.utilityFee : utilityFee,
    totalMonthlyDue: upcomingInvoice ? upcomingInvoice.amount : totalMonthlyDue,
    unitLabel: unit?.label || 'Unit',
    propertyName: property?.name || 'Property',
    parkingBay: parkingSpot,
  };

  const securityDeposit = profile?.securityDeposit || Math.round(rentAmount * 1.5);
  const autoPayEnabled = false;
  const paymentMethods = [];

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const overduePayments = payments.filter((p) => p.status === 'overdue');
  const totalPaidAllTime = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const history = payments.map((p) => {
    const paidDate = p.paidAt
      ? new Date(p.paidAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    return {
      id: p.receiptNumber || p._id.toString(),
      paymentId: p._id,
      period: p.period || `Rent Due ${p.dueDate ? new Date(p.dueDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : ''}`,
      amount: p.amount,
      baseRent: p.baseRent || Math.round(p.amount * 0.9),
      hasParking,
      parkingSpot,
      parkingFee: p.parkingFee !== undefined ? p.parkingFee : (hasParking ? parkingFee : 0),
      utilityFee: p.utilityFee !== undefined ? p.utilityFee : utilityFee,
      paidAt: paidDate || (p.status === 'paid' ? 'Landlord approved' : null),
      status: p.status,
      reviewStatus: p.reviewStatus || null,
      paymentChannel: p.paymentChannel || null,
      transferReference: p.transferReference || '',
      submittedAt: p.submittedAt || null,
      rejectionReason: p.rejectionReason || '',
      isAdvancePayment: Boolean(p.isAdvancePayment),
      advanceMonthsAhead: Number(p.advanceMonthsAhead || 0),
      receiptNumber: p.status === 'paid' ? (p.receiptNumber || null) : null,
      method: p.paymentMethod || p.paymentChannel || '—',
      dueDate: p.dueDate,
      createdAt: p.createdAt,
    };
  });

  return {
    tenant: {
      id: userDoc._id,
      name: [userDoc.firstName, userDoc.middleName, userDoc.lastName].filter(Boolean).join(' '),
      email: userDoc.email,
      phone: userDoc.phone || '',
    },
    unit: unit
      ? {
          id: unit._id,
          label: unit.label,
          monthlyRent: unit.monthlyRent,
        }
      : null,
    property: property
      ? {
          id: property._id,
          name: property.name,
          address: property.address,
          city: property.city,
        }
      : null,
    currentStatement,
    escrow: {
      securityDepositHeld: securityDeposit,
      status: 'FDIC Escrow Account Protected',
    },
    autoPay: {
      enabled: autoPayEnabled,
      scheduleText: autoPayEnabled ? 'Active (1st of month)' : 'Disabled',
    },
    paymentMethods,
    summary: {
      totalPaidAllTime,
      paidCount: paidPayments.length,
      overdueCount: overduePayments.length,
      pendingCount: payments.filter((p) => p.status === 'pending').length,
    },
    history,
  };
}

/**
 * GET /api/tenant/payments/:id/receipt
 * Retrieve official tax receipt for a cleared payment
 */
export async function getPaymentReceipt(tenantId, paymentId) {
  const { userDoc, profile, unit, property } = await resolveTenantContext(tenantId);

  let payment;
  if (paymentId === 'latest') {
    payment = await Payment.findOne({ tenant: tenantId, status: 'paid' })
      .sort({ paidAt: -1, createdAt: -1 })
      .lean();
  } else if (mongoose.Types.ObjectId.isValid(paymentId)) {
    payment = await Payment.findOne({ _id: paymentId, tenant: tenantId }).lean();
  } else {
    payment = await Payment.findOne({ mockTransactionId: paymentId, tenant: tenantId }).lean();
  }

  if (!payment) {
    throw new TenantPaymentError('Receipt or payment transaction not found', 404);
  }
  if (payment.status !== 'paid') throw new TenantPaymentError('A receipt is available after the landlord approves payment', 409);

  const amount = payment.amount;
  const hasParking = Boolean(profile?.hasParking ?? unit?.hasParking ?? (payment.parkingFee > 0));
  const parkingSpot = hasParking ? (profile?.parkingSpot || unit?.parkingSpot || 'Assigned Space') : null;
  const parkingFee = payment.parkingFee !== undefined ? Number(payment.parkingFee) : (hasParking ? Number(profile?.parkingFee ?? unit?.parkingFee ?? 0) : 0);
  const baseRent = payment.baseRent || Math.max(0, amount - parkingFee - (payment.utilityFee ?? 45));
  const utilityFee = payment.utilityFee ?? Math.max(0, amount - baseRent - parkingFee);

  const formattedPaidAt = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Paid & Cleared';

  return {
    receiptId: payment.receiptNumber || `RCP-${payment._id.toString().slice(-8).toUpperCase()}`,
    transactionId: payment.receiptNumber || `RCP-${payment._id.toString().slice(-8).toUpperCase()}`,
    paymentId: payment._id,
    period: payment.period || 'Monthly Rent Statement',
    amount,
    baseRent,
    hasParking,
    parkingSpot,
    parkingFee,
    utilityFee,
    paidAt: formattedPaidAt,
    status: payment.status,
    method: payment.paymentMethod || payment.paymentChannel || 'Landlord-approved payment',
    tenant: {
      name: [userDoc.firstName, userDoc.middleName, userDoc.lastName].filter(Boolean).join(' '),
      email: userDoc.email,
      phone: userDoc.phone || '',
    },
    unit: {
      label: unit?.label || 'Unit',
    },
    property: {
      name: property?.name || 'Property',
      address: property?.address || '',
      city: property?.city || '',
    },
  };
}

/**
 * POST /api/tenant/payments/pay
 * Execute rent payment transaction (card, ACH, apple_pay)
 */
export async function payRent(tenantId, data = {}, ipAddress = '') {
  throw new TenantPaymentError('Simulated card and ACH payments have been retired. Submit a transfer receipt or choose Pay Onsite for an unpaid invoice.', 410);
}

export async function getTenantPaymentOptions(tenantId) {
  const { property } = await resolveTenantContext(tenantId);
  if (!property?._id) return [];
  const options = await PaymentOption.find({
    landlord: property.landlord,
    isActive: true,
  }).sort({ createdAt: -1 }).lean();
  return options.map(({ _id, optionType, displayName, providerName, accountHolder, accountNumber, branch, qrImageUrl, instructions }) => ({
    id: _id,
    optionType,
    displayName,
    providerName,
    accountHolder,
    accountNumber,
    branch,
    qrImageUrl,
    instructions,
  }));
}

export async function submitPaymentEvidence(tenantId, paymentId, data = {}, file, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) throw new TenantPaymentError('Invalid invoice ID', 400);
  const payment = await Payment.findOne({ _id: paymentId, tenant: tenantId });
  assertSubmittable(payment);
  if (!['qr_transfer', 'bank_transfer', 'ewallet_transfer'].includes(data.channel)) throw new TenantPaymentError('Choose a QR, bank, or e-wallet transfer option', 400);
  if (!data.optionId || !mongoose.Types.ObjectId.isValid(data.optionId)) throw new TenantPaymentError('Payment option is required', 400);
  const tenantProperty = await Property.findById(payment.property).select('landlord').lean();
  const option = await PaymentOption.findOne({ _id: data.optionId, landlord: tenantProperty?.landlord, isActive: true });
  if (!option) throw new TenantPaymentError('Payment option is unavailable for this invoice', 404);
  const expectedOptionType = { qr_transfer: 'qr', bank_transfer: 'bank_account', ewallet_transfer: 'ewallet' }[data.channel];
  if (option.optionType !== expectedOptionType) throw new TenantPaymentError('Payment channel does not match the selected option', 400);
  if (!file?.buffer || !isValidReceiptFile(file)) throw new TenantPaymentError('Upload a valid PNG, JPG, WebP, or PDF transfer receipt', 400);
  if (file.size > 8 * 1024 * 1024) throw new TenantPaymentError('Receipt file must be 8 MB or smaller', 400);
  const reference = String(data.transferReference || '').trim();
  const note = String(data.note || '').trim();
  if (reference.length > 120 || note.length > 1000) throw new TenantPaymentError('Reference or note is too long', 400);

  const uploaded = await uploadPaymentAssetToCloudinary(file.buffer, file.originalname, { privateAsset: true, folder: 'jptl_payment_receipts' });
  if (payment.status === 'draft') payment.status = 'pending';
  payment.reviewStatus = 'pending_review';
  payment.paymentChannel = data.channel;
  payment.paymentOption = option._id;
  payment.paymentOptionSnapshot = {
    optionType: option.optionType,
    displayName: option.displayName,
    providerName: option.providerName,
    accountHolder: option.accountHolder,
    accountNumber: option.accountNumber,
    branch: option.branch,
  };
  payment.receiptPublicId = uploaded.public_id;
  payment.receiptFormat = uploaded.format || file.originalname.split('.').pop()?.toLowerCase();
  payment.receiptOriginalName = file.originalname;
  payment.receiptBytes = uploaded.bytes || file.size;
  payment.transferReference = reference;
  payment.tenantPaymentNote = note;
  payment.submittedAt = new Date();
  payment.reviewedAt = null;
  payment.reviewedBy = null;
  payment.rejectionReason = '';
  payment.paymentMethod = `${option.displayName} transfer`;
  await payment.save();
  await AuditLog.create({ actor: tenantId, actorRole: 'tenant', action: 'PAYMENT_EVIDENCE_SUBMITTED', entityKind: 'Payment', entityId: payment._id, ipAddress });
  await notifyPaymentSubmitted(payment);
  return { paymentId: payment._id, status: payment.status, reviewStatus: payment.reviewStatus, submittedAt: payment.submittedAt };
}

export async function submitOnsitePayment(tenantId, paymentId, { note = '' } = {}, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) throw new TenantPaymentError('Invalid invoice ID', 400);
  const payment = await Payment.findOne({ _id: paymentId, tenant: tenantId });
  assertSubmittable(payment);
  const cleanNote = String(note || '').trim();
  if (cleanNote.length > 1000) throw new TenantPaymentError('Note must be 1000 characters or fewer', 400);
  payment.reviewStatus = 'pending_review';
  if (payment.status === 'draft') payment.status = 'pending';
  payment.paymentChannel = 'onsite';
  payment.paymentOption = null;
  payment.paymentOptionSnapshot = { optionType: 'onsite', displayName: 'Pay Onsite' };
  payment.receiptPublicId = null;
  payment.receiptFormat = null;
  payment.receiptOriginalName = null;
  payment.receiptBytes = 0;
  payment.transferReference = '';
  payment.tenantPaymentNote = cleanNote;
  payment.submittedAt = new Date();
  payment.reviewedAt = null;
  payment.reviewedBy = null;
  payment.rejectionReason = '';
  payment.paymentMethod = 'Pay Onsite — Awaiting Landlord Confirmation';
  await payment.save();
  await AuditLog.create({ actor: tenantId, actorRole: 'tenant', action: 'ONSITE_PAYMENT_SUBMITTED', entityKind: 'Payment', entityId: payment._id, ipAddress });
  await notifyPaymentSubmitted(payment);
  return { paymentId: payment._id, status: payment.status, reviewStatus: payment.reviewStatus, paymentChannel: payment.paymentChannel, submittedAt: payment.submittedAt };
}

export async function getTenantPaymentEvidence(tenantId, paymentId) {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) throw new TenantPaymentError('Invalid invoice ID', 400);
  const payment = await Payment.findOne({ _id: paymentId, tenant: tenantId }).lean();
  if (!payment || !payment.receiptPublicId) throw new TenantPaymentError('Payment evidence not found', 404);
  const resourceType = payment.receiptFormat === 'pdf' ? 'raw' : 'image';
  const downloadUrl = await getPrivatePaymentAssetUrl(payment.receiptPublicId, payment.receiptFormat, resourceType);
  if (!downloadUrl) throw new TenantPaymentError('Payment evidence storage is unavailable', 404);
  const response = await fetch(downloadUrl);
  if (!response.ok) throw new TenantPaymentError('Payment evidence could not be loaded', 502);
  return { stream: response.body, name: payment.receiptOriginalName || 'payment-receipt', mimeType: response.headers.get('content-type') || (payment.receiptFormat === 'pdf' ? 'application/pdf' : `image/${payment.receiptFormat || 'jpeg'}`) };
}

/**
 * PATCH /api/tenant/payments/autopay
 * Toggle auto-pay setting
 */
export async function toggleAutoPay(tenantId, enabled) {
  return {
    autoPayEnabled: false,
    message: 'Automatic payments are unavailable. Submit a transfer receipt or choose Pay Onsite.',
  };
}

/**
 * GET /api/tenant/payments/methods
 * List tenant saved payment methods
 */
export async function getPaymentMethods(tenantId) {
  return [];
}

/**
 * POST /api/tenant/payments/methods
 * Add a new payment method
 */
export async function addPaymentMethod(tenantId, methodData) {
  throw new TenantPaymentError('Saved card and ACH payments are unavailable. Use a landlord payment option.', 410);
}

/**
 * DELETE /api/tenant/payments/methods/:methodId
 * Delete a saved payment method
 */
export async function deletePaymentMethod(tenantId, methodId) {
  const profile = await TenantProfile.findOne({ user: tenantId });
  if (!profile) {
    throw new TenantPaymentError('Profile not found', 404);
  }

  profile.paymentMethods = profile.paymentMethods.filter((m) => m.id !== methodId);
  await profile.save();

  return { message: 'Payment method deleted successfully' };
}

/**
 * POST /api/tenant/payments/pay-advance
 * Pay one or more months in advance — strictly within the active lease period.
 * Months already paid are skipped; cannot pay beyond lease end date.
 */
export async function payInAdvance(tenantId, data = {}, ipAddress = '') {
  throw new TenantPaymentError('Advance payments are unavailable in the receipt review workflow.', 410);
}

function firstOfNextMonth(date) {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

async function buildRentInvoice(tenantId, { dueDate, months = 1, isAdvance = false, ipAddress = '' }) {
  const { profile, unit, property } = await resolveTenantContext(tenantId);
  const activeLease = await Lease.findOne({ tenant: tenantId, status: { $in: ['active', 'renewal_pending', 'renewal_approved'] } }).lean();
  const leaseEnd = activeLease ? activeLease.leaseEnd : profile?.leaseEnd;
  const finalMonth = new Date(dueDate);
  finalMonth.setMonth(finalMonth.getMonth() + months - 1);
  if (leaseEnd && (finalMonth.getFullYear() > new Date(leaseEnd).getFullYear() || (finalMonth.getFullYear() === new Date(leaseEnd).getFullYear() && finalMonth.getMonth() > new Date(leaseEnd).getMonth()))) {
    throw new TenantPaymentError('The rent period extends beyond your lease end date.', 409);
  }
  const rent = Number(profile?.monthlyRent || unit?.monthlyRent || 0);
  if (!unit?._id || !property?._id || rent <= 0) throw new TenantPaymentError('A landlord-assigned unit with a monthly rent amount is required before creating a rent invoice.', 409);
  const hasParking = Boolean(profile?.hasParking ?? unit?.hasParking ?? false);
  const parking = hasParking ? Number(profile?.parkingFee ?? unit?.parkingFee ?? 0) : 0;
  const utilities = 45;
  const amount = (rent + parking + utilities) * months;
  const periodMonth = dueDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const payment = await Payment.create({
    tenant: tenantId, unit: unit._id, property: property._id,
    amount, baseRent: rent * months, parkingFee: parking * months, utilityFee: utilities * months,
    dueDate, status: isAdvance ? 'draft' : dueDate < new Date(new Date().setHours(0, 0, 0, 0)) ? 'overdue' : 'pending',
    period: isAdvance ? `${months} month${months === 1 ? '' : 's'} rent in advance (from ${periodMonth})` : `Rent Due ${periodMonth}`,
    isAdvancePayment: isAdvance, advanceMonthsAhead: isAdvance ? months : 0,
  });
  await AuditLog.create({ actor: tenantId, actorRole: 'tenant', action: isAdvance ? 'ADVANCE_RENT_INVOICE_CREATED' : 'CURRENT_RENT_INVOICE_CREATED', entityKind: 'Payment', entityId: payment._id, ipAddress });
  return payment;
}

export async function getOrCreateCurrentRentInvoice(tenantId, ipAddress = '') {
  const existing = await Payment.findOne({ tenant: tenantId, status: { $in: ['pending', 'overdue'] }, isAdvancePayment: { $ne: true } }).sort({ dueDate: 1, createdAt: 1 });
  if (existing) return existing.toObject();
  const latest = await Payment.findOne({ tenant: tenantId, status: { $ne: 'draft' }, $or: [{ isAdvancePayment: { $ne: true } }, { status: 'paid' }, { submittedAt: { $ne: null } }] }).sort({ dueDate: -1, createdAt: -1 }).lean();
  const now = new Date();
  const dueDate = latest ? firstOfNextMonth(latest.dueDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  const duplicate = await Payment.findOne({ tenant: tenantId, dueDate, isAdvancePayment: { $ne: true }, status: { $in: ['pending', 'overdue'] } });
  if (duplicate) return duplicate.toObject();
  return (await buildRentInvoice(tenantId, { dueDate, ipAddress })).toObject();
}

export async function createAdvanceRentInvoice(tenantId, { monthsAhead = 1 } = {}, ipAddress = '') {
  const months = Number.parseInt(monthsAhead, 10);
  if (!Number.isInteger(months) || months < 1 || months > 12) throw new TenantPaymentError('Choose between 1 and 12 months for advance rent.', 400);
  const lease = await Lease.findOne({ tenant: tenantId, status: { $in: ['active', 'renewal_pending', 'renewal_approved'] } }).lean();
  if (!lease) throw new TenantPaymentError('An active lease is required to create an advance rent invoice.', 409);
  const pendingAdvanceReview = await Payment.findOne({ tenant: tenantId, isAdvancePayment: true, reviewStatus: 'pending_review' }).lean();
  if (pendingAdvanceReview) throw new TenantPaymentError('An advance payment is already waiting for landlord review.', 409);
  const existingDraft = await Payment.findOne({
    tenant: tenantId,
    isAdvancePayment: true,
    $or: [
      { status: 'draft' },
      { status: { $in: ['pending', 'overdue'] }, reviewStatus: null, submittedAt: null },
    ],
  }).sort({ createdAt: -1 });
  if (existingDraft) {
    existingDraft.status = 'draft';
    const { profile, unit } = await resolveTenantContext(tenantId);
    const monthlyBase = Number(profile?.monthlyRent || unit?.monthlyRent || 0);
    const parking = Boolean(profile?.hasParking ?? unit?.hasParking) ? Number(profile?.parkingFee ?? unit?.parkingFee ?? 0) : 0;
    if (monthlyBase <= 0) throw new TenantPaymentError('A monthly rent amount is required before creating an advance payment.', 409);
    const monthlyAmount = monthlyBase + parking + 45;
    const finalDraftMonth = new Date(existingDraft.dueDate);
    finalDraftMonth.setMonth(finalDraftMonth.getMonth() + months - 1);
    const currentLeaseEnd = lease.leaseEnd ? new Date(lease.leaseEnd) : null;
    if (currentLeaseEnd && (finalDraftMonth.getFullYear() > currentLeaseEnd.getFullYear() || (finalDraftMonth.getFullYear() === currentLeaseEnd.getFullYear() && finalDraftMonth.getMonth() > currentLeaseEnd.getMonth()))) {
      throw new TenantPaymentError('The selected advance period extends beyond your lease end date.', 400);
    }
    existingDraft.amount = monthlyAmount * months;
    existingDraft.baseRent = monthlyBase * months;
    existingDraft.parkingFee = parking * months;
    existingDraft.utilityFee = 45 * months;
    existingDraft.advanceMonthsAhead = months;
    existingDraft.period = `${months} month${months === 1 ? '' : 's'} rent in advance`;
    await existingDraft.save();
    return existingDraft.toObject();
  }
  const latestInvoice = await Payment.findOne({ tenant: tenantId, status: { $ne: 'draft' }, $or: [{ isAdvancePayment: { $ne: true } }, { status: 'paid' }, { submittedAt: { $ne: null } }] }).sort({ dueDate: -1, createdAt: -1 }).lean();
  const now = new Date();
  const firstDueDate = latestInvoice ? firstOfNextMonth(latestInvoice.dueDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  const finalMonth = new Date(firstDueDate);
  finalMonth.setMonth(finalMonth.getMonth() + months - 1);
  const leaseEnd = lease.leaseEnd ? new Date(lease.leaseEnd) : null;
  if (leaseEnd && (finalMonth.getFullYear() > leaseEnd.getFullYear() || (finalMonth.getFullYear() === leaseEnd.getFullYear() && finalMonth.getMonth() > leaseEnd.getMonth()))) {
    throw new TenantPaymentError('The selected advance period extends beyond your lease end date.', 400);
  }
  const duplicate = await Payment.findOne({ tenant: tenantId, dueDate: firstDueDate, isAdvancePayment: true, status: { $in: ['draft', 'pending', 'overdue'] } });
  if (duplicate?.reviewStatus === 'pending_review') throw new TenantPaymentError('This advance rent invoice is already waiting for landlord review.', 409);
  if (duplicate) return duplicate.toObject();
  return (await buildRentInvoice(tenantId, { dueDate: firstDueDate, months, isAdvance: true, ipAddress })).toObject();
}

export async function discardAdvanceRentDraft(tenantId, paymentId, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) throw new TenantPaymentError('Invalid advance payment ID', 400);
  const draft = await Payment.findOne({ _id: paymentId, tenant: tenantId, isAdvancePayment: true, status: 'draft' });
  if (!draft) throw new TenantPaymentError('Advance payment draft not found or already submitted', 404);
  await Payment.deleteOne({ _id: draft._id, tenant: tenantId, status: 'draft' });
  await AuditLog.create({ actor: tenantId, actorRole: 'tenant', action: 'ADVANCE_RENT_DRAFT_DISCARDED', entityKind: 'Payment', entityId: draft._id, ipAddress });
  return { paymentId: draft._id, discarded: true };
}
