import mongoose from 'mongoose';
import User from '../../../shared/models/user.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import Payment from '../../../shared/models/payment.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';

class TenantPaymentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Default mock payment methods if tenant profile has none
 */
const DEFAULT_PAYMENT_METHODS = [
  {
    id: 'pm-card-1',
    brand: 'Visa',
    last4: '4242',
    type: 'card',
    isDefault: true,
    expiry: '08/28',
  },
  {
    id: 'pm-ach-1',
    brand: 'Chase Bank ACH',
    last4: '9102',
    type: 'ach',
    isDefault: false,
    expiry: null,
  },
];

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
  const parkingFee = 150;
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
    parkingFee: upcomingInvoice?.parkingFee || parkingFee,
    utilityFee: upcomingInvoice?.utilityFee || utilityFee,
    totalMonthlyDue: upcomingInvoice ? upcomingInvoice.amount : totalMonthlyDue,
    unitLabel: unit?.label || 'Unit 14B',
    propertyName: property?.name || 'Aura Sky Towers',
    parkingBay: 'Level 2, Bay #14B',
  };

  const securityDeposit = profile?.securityDeposit || Math.round(rentAmount * 1.5);
  const autoPayEnabled = profile?.autoPayEnabled ?? true;

  const paymentMethods = (profile?.paymentMethods && profile.paymentMethods.length > 0)
    ? profile.paymentMethods
    : DEFAULT_PAYMENT_METHODS;

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
      id: p.mockTransactionId || `TXN-${p._id.toString().slice(-7).toUpperCase()}`,
      paymentId: p._id,
      period: p.period || `Rent Due ${p.dueDate ? new Date(p.dueDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : ''}`,
      amount: p.amount,
      baseRent: p.baseRent || Math.round(p.amount * 0.9),
      parkingFee: p.parkingFee || parkingFee,
      utilityFee: p.utilityFee || utilityFee,
      paidAt: paidDate || (p.status === 'paid' ? 'Paid & Cleared' : null),
      status: p.status,
      method: p.paymentMethod || 'Visa •••• 4242',
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
  const { userDoc, unit, property } = await resolveTenantContext(tenantId);

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

  const amount = payment.amount;
  const baseRent = payment.baseRent || Math.round(amount * 0.9);
  const parkingFee = payment.parkingFee ?? 150;
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
    receiptId: payment.mockTransactionId || `TXN_${payment._id.toString().slice(-8).toUpperCase()}`,
    transactionId: payment.mockTransactionId || `TXN_${payment._id.toString().slice(-8).toUpperCase()}`,
    paymentId: payment._id,
    period: payment.period || 'Monthly Rent Statement',
    amount,
    baseRent,
    parkingFee,
    utilityFee,
    paidAt: formattedPaidAt,
    status: payment.status,
    method: payment.paymentMethod || 'Visa ending in 4242',
    tenant: {
      name: [userDoc.firstName, userDoc.middleName, userDoc.lastName].filter(Boolean).join(' '),
      email: userDoc.email,
      phone: userDoc.phone || '',
    },
    unit: {
      label: unit?.label || 'Unit 14B',
    },
    property: {
      name: property?.name || 'Aura Sky Towers',
      address: property?.address || '88 Horizon Boulevard',
      city: property?.city || 'Downtown Metro',
    },
    company: {
      name: 'JPTL.SYSTEM',
      legalTitle: 'Property Management & Leasing Services LLC',
      ein: '84-2901452',
      license: 'License #PM-992014',
      authorizedSignature: 'Alexander Vance',
    },
  };
}

/**
 * POST /api/tenant/payments/pay
 * Execute rent payment transaction (card, ACH, apple_pay)
 */
export async function payRent(tenantId, data = {}, ipAddress = '') {
  const { userDoc, profile, unit, property } = await resolveTenantContext(tenantId);

  const { paymentMethod = 'card', paymentId, period } = data;

  const baseMonthlyRent = profile?.monthlyRent || unit?.monthlyRent || 2400;
  const parkingFee = 150;
  const utilityFee = 45;
  const processingFee = paymentMethod === 'card' ? 45.0 : 0.0;

  let baseAmount = data.amount ? Number(data.amount) : baseMonthlyRent + parkingFee + utilityFee;
  const totalAmount = baseAmount + processingFee;

  const mockTxId = `TXN_${Math.floor(10000000 + Math.random() * 90000000)}`;
  const now = new Date();

  let methodLabel = 'Visa ending in 4242';
  if (paymentMethod === 'ach') {
    methodLabel = 'Chase Bank ACH ending in 9102';
  } else if (paymentMethod === 'apple_pay') {
    methodLabel = 'Apple Pay (Mastercard •••• 8812)';
  } else if (data.cardLast4) {
    methodLabel = `${data.cardBrand || 'Card'} ending in ${data.cardLast4}`;
  }

  const currentPeriod = period || `Rent Due ${now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`;

  let payment;

  if (paymentId && mongoose.Types.ObjectId.isValid(paymentId)) {
    payment = await Payment.findOne({ _id: paymentId, tenant: tenantId });
  } else {
    // Check if there is an open pending invoice
    payment = await Payment.findOne({ tenant: tenantId, status: { $in: ['pending', 'overdue'] } });
  }

  if (payment) {
    payment.status = 'paid';
    payment.paidAt = now;
    payment.mockTransactionId = mockTxId;
    payment.paymentMethod = methodLabel;
    payment.processingFee = processingFee;
    payment.amount = totalAmount;
    if (!payment.period) payment.period = currentPeriod;
    await payment.save();
  } else {
    // Create new cleared payment
    payment = new Payment({
      tenant: tenantId,
      unit: unit ? unit._id : profile?.unit || null,
      property: property ? property._id : profile?.property || null,
      amount: totalAmount,
      baseRent: baseMonthlyRent,
      parkingFee,
      utilityFee,
      processingFee,
      dueDate: now,
      status: 'paid',
      period: currentPeriod,
      paymentMethod: methodLabel,
      mockTransactionId: mockTxId,
      paidAt: now,
    });
    await payment.save();
  }

  // Audit log
  await AuditLog.create({
    actor: tenantId,
    actorRole: 'tenant',
    action: 'PAYMENT_CONFIRMED_EVENT',
    entityKind: 'Payment',
    entityId: payment._id,
    ipAddress,
  });

  const receipt = await getPaymentReceipt(tenantId, payment._id);

  return {
    receipt,
    payment,
    message: 'Payment processed successfully',
  };
}

/**
 * PATCH /api/tenant/payments/autopay
 * Toggle auto-pay setting
 */
export async function toggleAutoPay(tenantId, enabled) {
  let profile = await TenantProfile.findOne({ user: tenantId });
  if (!profile) {
    profile = new TenantProfile({ user: tenantId, autoPayEnabled: enabled });
  } else {
    profile.autoPayEnabled = Boolean(enabled);
  }
  await profile.save();

  return {
    autoPayEnabled: profile.autoPayEnabled,
    message: `Auto-pay successfully ${profile.autoPayEnabled ? 'enabled' : 'disabled'}`,
  };
}

/**
 * GET /api/tenant/payments/methods
 * List tenant saved payment methods
 */
export async function getPaymentMethods(tenantId) {
  const profile = await TenantProfile.findOne({ user: tenantId }).lean();
  const methods = profile?.paymentMethods?.length ? profile.paymentMethods : DEFAULT_PAYMENT_METHODS;
  return methods;
}

/**
 * POST /api/tenant/payments/methods
 * Add a new payment method
 */
export async function addPaymentMethod(tenantId, methodData) {
  const { brand = 'Visa', last4 = '1234', type = 'card', expiry = '12/28', isDefault = false } = methodData;

  let profile = await TenantProfile.findOne({ user: tenantId });
  if (!profile) {
    profile = new TenantProfile({ user: tenantId, paymentMethods: [] });
  }

  const newMethod = {
    id: `pm-${Date.now()}`,
    brand,
    last4,
    type,
    expiry,
    isDefault: Boolean(isDefault),
  };

  if (isDefault) {
    profile.paymentMethods.forEach((m) => {
      m.isDefault = false;
    });
  }

  profile.paymentMethods.push(newMethod);
  await profile.save();

  return newMethod;
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
