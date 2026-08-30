import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import User from '../../../shared/models/user.model.js';
import TenantProfile from '../../../shared/models/tenatntProfile.model.js';
import Ticket from '../../../shared/models/ticket.model.js';
import Payment from '../../../shared/models/payment.model.js';
import Announcement from '../../../shared/models/announcements.model.js';

class DashError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Build the main landlord dashboard summary.
 *
 * Returns KPI metrics, property breakdown, recent tickets, recent payments,
 * the pinned announcement, and a per-property occupancy breakdown — all in
 * one round-trip per collection to minimise latency.
 *
 * @param {string} landlordId  - ObjectId of the authenticated landlord
 * @returns {Promise<object>}
 */
async function getLandlordDashboard(landlordId) {
  // 1. Resolve landlord properties (scoped ownership boundary)
  const [properties, landlordDoc] = await Promise.all([
    Property.find({ landlord: landlordId }).lean(),
    User.findById(landlordId).lean(),
  ]);

  if (!landlordDoc) throw new DashError('Landlord not found', 404);

  const propertyIds = properties.map((p) => p._id);

  // 2. Parallel collection queries (all scoped to landlord's properties)
  const [units, tenants, pinnedAnnouncement] = await Promise.all([
    Unit.find({ property: { $in: propertyIds } })
      .populate('tenant', 'firstName lastName email')
      .lean(),
    User.find({ landlord: landlordId, role: 'tenant' })
      .select('firstName middleName lastName email createdAt status')
      .lean(),
    Announcement.findOne({ author: landlordId, isPinned: true })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  // Query tickets and payments after units are resolved
  const unitIds = units.map((u) => u._id);

  const [resolvedTickets, resolvedPayments] = await Promise.all([
    Ticket.find({ unit: { $in: unitIds } })
      .populate('unit', 'label property')
      .populate('tenant', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean(),
    Payment.find({ unit: { $in: unitIds } })
      .populate('tenant', 'firstName lastName')
      .populate('unit', 'label')
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  // 3. KPI computation
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const vacantUnits = units.filter((u) => u.status === 'vacant').length;
  const maintenanceUnits = units.filter((u) => u.status === 'maintenance').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const totalMonthlyRevenue = units
    .filter((u) => u.status === 'occupied')
    .reduce((sum, u) => sum + (u.monthlyRent || 0), 0);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active').length;

  const pendingTickets = resolvedTickets.filter(
    (t) => !['resolved', 'cancelled'].includes(t.status)
  ).length;
  const openTickets = resolvedTickets.filter((t) => t.status === 'submitted').length;
  const inProgressTickets = resolvedTickets.filter((t) => t.status === 'in_progress').length;

  // Payments: current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthPayments = resolvedPayments.filter((p) => new Date(p.createdAt) >= startOfMonth);
  const collectedThisMonth = monthPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const overduePayments = resolvedPayments.filter((p) => p.status === 'overdue').length;

  // 4. Per-property breakdown
  const propertyBreakdown = properties.map((prop) => {
    const propUnits = units.filter((u) => u.property.toString() === prop._id.toString());
    const propOccupied = propUnits.filter((u) => u.status === 'occupied').length;
    const propRevenue = propUnits
      .filter((u) => u.status === 'occupied')
      .reduce((sum, u) => sum + (u.monthlyRent || 0), 0);
    return {
      id: prop._id,
      name: prop.name,
      address: prop.address,
      city: prop.city,
      category: prop.category,
      image: prop.image,
      totalUnits: propUnits.length,
      occupiedUnits: propOccupied,
      vacantUnits: propUnits.length - propOccupied,
      occupancyRate: propUnits.length > 0 ? Math.round((propOccupied / propUnits.length) * 100) : 0,
      monthlyRevenue: propRevenue,
    };
  });

  // 5. Recent activity slices
  const recentTickets = resolvedTickets.slice(0, 5).map((t) => ({
    id: t._id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    status: t.status,
    unitLabel: t.unit?.label || 'Unknown Unit',
    tenantName: t.tenant
      ? `${t.tenant.firstName} ${t.tenant.lastName}`
      : 'Unknown Tenant',
    createdAt: t.createdAt,
  }));

  const recentPayments = resolvedPayments.slice(0, 5).map((p) => ({
    id: p._id,
    amount: p.amount,
    status: p.status,
    dueDate: p.dueDate,
    paidAt: p.paidAt,
    unitLabel: p.unit?.label || 'Unknown Unit',
    tenantName: p.tenant
      ? `${p.tenant.firstName} ${p.tenant.lastName}`
      : 'Unknown Tenant',
    createdAt: p.createdAt,
  }));

  return {
    landlord: {
      id: landlordDoc._id,
      firstName: landlordDoc.firstName,
      lastName: landlordDoc.lastName,
      email: landlordDoc.email,
      plan: landlordDoc.plan,
      onboardingCompleted: landlordDoc.onboardingCompleted,
    },
    kpi: {
      totalProperties: properties.length,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      occupancyRate,
      totalMonthlyRevenue,
      totalTenants,
      activeTenants,
      pendingTickets,
      openTickets,
      inProgressTickets,
      collectedThisMonth,
      overduePayments,
    },
    propertyBreakdown,
    recentTickets,
    recentPayments,
    pinnedAnnouncement: pinnedAnnouncement
      ? {
          id: pinnedAnnouncement._id,
          title: pinnedAnnouncement.title,
          content: pinnedAnnouncement.content,
          category: pinnedAnnouncement.category,
          createdAt: pinnedAnnouncement.createdAt,
        }
      : null,
  };
}

/**
 * Return condensed KPI-only snapshot — lightweight polling endpoint.
 * Suitable for header badge refresh (e.g. pending tickets count).
 *
 * @param {string} landlordId
 */
async function getLandlordKpi(landlordId) {
  const properties = await Property.find({ landlord: landlordId }).select('_id').lean();
  const propertyIds = properties.map((p) => p._id);

  const units = await Unit.find({ property: { $in: propertyIds } }).select('status monthlyRent').lean();
  const unitIds = units.map((u) => u._id);

  const [tenantCount, ticketCount, overdueCount] = await Promise.all([
    User.countDocuments({ landlord: landlordId, role: 'tenant' }),
    Ticket.countDocuments({ unit: { $in: unitIds }, status: { $nin: ['resolved', 'cancelled'] } }),
    Payment.countDocuments({ unit: { $in: unitIds }, status: 'overdue' }),
  ]);

  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const totalRevenue = units
    .filter((u) => u.status === 'occupied')
    .reduce((sum, u) => sum + (u.monthlyRent || 0), 0);

  return {
    totalProperties: properties.length,
    totalUnits: units.length,
    occupiedUnits,
    vacantUnits: units.length - occupiedUnits,
    occupancyRate: units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0,
    totalMonthlyRevenue: totalRevenue,
    totalTenants: tenantCount,
    pendingTickets: ticketCount,
    overduePayments: overdueCount,
  };
}

export { DashError, getLandlordDashboard, getLandlordKpi };
