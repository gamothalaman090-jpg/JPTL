import User from '../../../shared/models/user.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import Ticket from '../../../shared/models/ticket.model.js';
import Payment from '../../../shared/models/payment.model.js';
import Announcement from '../../../shared/models/announcements.model.js';

class TenantDashError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Resolve a tenant's active profile, unit, and property.
 * @param {string} tenantId
 */
async function resolveTenantContext(tenantId) {
  const profile = await TenantProfile.findOne({ user: tenantId })
    .populate('unit')
    .populate('property')
    .lean();

  return profile;
}

/**
 * GET /api/tenant/dash
 *
 * Returns the full tenant dashboard payload:
 *  - Tenant profile (name, email, lease status)
 *  - Current unit & property details
 *  - Payment summary (upcoming, overdue, history)
 *  - Maintenance tickets (open + recent)
 *  - Announcements from their landlord
 *  - Lease summary
 *
 * @param {string} tenantId - ObjectId of the authenticated tenant
 */
async function getTenantDashboard(tenantId) {
  // 1. Load user doc and profile in parallel
  const [tenantUser, profile] = await Promise.all([
    User.findById(tenantId).select('firstName middleName lastName email phone status createdAt landlord').lean(),
    resolveTenantContext(tenantId),
  ]);

  if (!tenantUser) throw new TenantDashError('Tenant not found', 404);

  const unitId = profile?.unit?._id ?? null;
  const landlordId = tenantUser.landlord ?? null;

  // 2. Parallel secondary queries — scoped to tenant's unit
  const [tickets, payments, announcements] = await Promise.all([
    unitId
      ? Ticket.find({ tenant: tenantId })
          .sort({ createdAt: -1 })
          .lean()
      : Promise.resolve([]),
    unitId
      ? Payment.find({ tenant: tenantId })
          .sort({ dueDate: 1 })
          .lean()
      : Promise.resolve([]),
    landlordId
      ? Announcement.find({ author: landlordId })
          .sort({ isPinned: -1, createdAt: -1 })
          .limit(10)
          .lean()
      : Promise.resolve([]),
  ]);

  // 3. Payment KPIs
  const now = new Date();
  const upcomingPayment = payments.find(
    (p) => p.status === 'pending' && new Date(p.dueDate) >= now
  ) || null;
  const overduePayments = payments.filter((p) => p.status === 'overdue');
  const paidPayments = payments.filter((p) => p.status === 'paid');
  const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // 4. Ticket KPIs
  const openTickets = tickets.filter((t) => !['resolved', 'cancelled'].includes(t.status));
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved');

  // 5. Lease info from profile
  const unit = profile?.unit || null;
  const property = profile?.property || null;
  const leaseStart = profile?.leaseStart ?? unit?.leaseStart ?? null;
  const leaseEnd = profile?.leaseEnd ?? unit?.leaseEnd ?? null;
  let leaseStatus = 'no_lease';
  if (leaseStart && leaseEnd) {
    const end = new Date(leaseEnd);
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) leaseStatus = 'expired';
    else if (daysRemaining <= 30) leaseStatus = 'expiring_soon';
    else leaseStatus = 'active';
  } else if (profile?.status === 'active') {
    leaseStatus = 'active';
  }

  // 6. Shape recent data slices
  const recentTickets = tickets.slice(0, 5).map((t) => ({
    id: t._id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt,
  }));

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((p) => ({
      id: p._id,
      amount: p.amount,
      status: p.status,
      dueDate: p.dueDate,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    }));

  const formattedAnnouncements = announcements.map((a) => ({
    id: a._id,
    title: a.title,
    content: a.content,
    category: a.category,
    isPinned: a.isPinned,
    createdAt: a.createdAt,
  }));

  return {
    tenant: {
      id: tenantUser._id,
      firstName: tenantUser.firstName,
      middleName: tenantUser.middleName || '',
      lastName: tenantUser.lastName,
      fullName: [tenantUser.firstName, tenantUser.middleName, tenantUser.lastName]
        .filter(Boolean)
        .join(' '),
      email: tenantUser.email,
      phone: tenantUser.phone || '',
      status: tenantUser.status,
      memberSince: tenantUser.createdAt,
    },
    lease: {
      status: leaseStatus,
      leaseStart,
      leaseEnd,
      monthlyRent: profile?.monthlyRent ?? unit?.monthlyRent ?? 0,
      tenantStatus: profile?.status ?? 'pre_added',
    },
    unit: unit
      ? {
          id: unit._id,
          label: unit.label,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          sqft: unit.sqft,
          monthlyRent: unit.monthlyRent,
          status: unit.status,
        }
      : null,
    property: property
      ? {
          id: property._id,
          name: property.name,
          address: property.address,
          city: property.city,
          image: property.image,
          category: property.category,
        }
      : null,
    payments: {
      upcoming: upcomingPayment
        ? {
            id: upcomingPayment._id,
            amount: upcomingPayment.amount,
            dueDate: upcomingPayment.dueDate,
            status: upcomingPayment.status,
          }
        : null,
      overdueCount: overduePayments.length,
      totalOverdueAmount: overduePayments.reduce((s, p) => s + (p.amount || 0), 0),
      totalPaidAllTime: totalPaid,
      paidCount: paidPayments.length,
      recent: recentPayments,
    },
    tickets: {
      totalOpen: openTickets.length,
      totalResolved: resolvedTickets.length,
      recent: recentTickets,
    },
    announcements: formattedAnnouncements,
  };
}

/**
 * Lightweight KPI-only snapshot for badge/header refresh.
 * @param {string} tenantId
 */
async function getTenantKpi(tenantId) {
  const profile = await TenantProfile.findOne({ user: tenantId }).select('status monthlyRent').lean();

  const [openTickets, overduePayments, upcomingPayment] = await Promise.all([
    Ticket.countDocuments({ tenant: tenantId, status: { $nin: ['resolved', 'cancelled'] } }),
    Payment.countDocuments({ tenant: tenantId, status: 'overdue' }),
    Payment.findOne({ tenant: tenantId, status: 'pending' }).sort({ dueDate: 1 }).select('amount dueDate').lean(),
  ]);

  return {
    leaseStatus: profile?.status ?? 'pre_added',
    monthlyRent: profile?.monthlyRent ?? 0,
    openTickets,
    overduePayments,
    nextPayment: upcomingPayment
      ? { amount: upcomingPayment.amount, dueDate: upcomingPayment.dueDate }
      : null,
  };
}

export { TenantDashError, getTenantDashboard, getTenantKpi };
