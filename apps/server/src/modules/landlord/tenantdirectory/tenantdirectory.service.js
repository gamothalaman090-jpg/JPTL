import User from '../../../shared/models/user.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import Ticket from '../../../shared/models/ticket.model.js';
import Payment from '../../../shared/models/payment.model.js';
import Document from '../../../shared/models/document.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import { sendTenantWelcomeEmail } from '../../../shared/utils/mailer.js';
import crypto from 'crypto';

class TenantDirectoryError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateTemporaryPassword() {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `JPTL-${code}`;
}

async function logAction({ actorId, action, entityKind, entityId, ipAddress = '' }) {
  try {
    await AuditLog.create({
      actor: actorId,
      actorRole: 'landlord',
      action,
      entityKind,
      entityId,
      ipAddress,
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
}

/**
 * Update property metrics (unitsCount, occupancyRate)
 */
async function updatePropertyMetrics(propertyId) {
  if (!propertyId) return;
  const units = await Unit.find({ property: propertyId }).lean();
  const total = units.length;
  const occupied = units.filter((u) => u.status === 'occupied').length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  await Property.findByIdAndUpdate(propertyId, {
    unitsCount: total,
    occupancyRate,
  });
}

/**
 * GET all tenants for the authenticated landlord with search, filter, and summary counts.
 *
 * @param {string} landlordId
 * @param {object} query - { search, status, propertyId }
 */
async function getTenantDirectory(landlordId, query = {}) {
  const { search = '', status = 'all', propertyId = '' } = query;

  // 1. Find all properties belonging to this landlord
  const landlordProperties = await Property.find({ landlord: landlordId }).lean();
  const propertyIds = landlordProperties.map((p) => p._id);
  const propertyMap = new Map(landlordProperties.map((p) => [p._id.toString(), p]));

  // 2. Find all tenant users registered under this landlord
  const tenantUsers = await User.find({
    landlord: landlordId,
    role: 'tenant',
  }).select('firstName middleName lastName email phone status createdAt').lean();

  if (tenantUsers.length === 0) {
    return {
      summary: {
        totalTenants: 0,
        activeLeasesCount: 0,
        preAddedCount: 0,
      },
      tenants: [],
    };
  }

  const tenantUserIds = tenantUsers.map((u) => u._id);

  // 3. Find tenant profiles
  const profileFilter = { user: { $in: tenantUserIds } };
  if (propertyId) {
    profileFilter.property = propertyId;
  }

  const profiles = await TenantProfile.find(profileFilter)
    .populate('unit')
    .populate('property')
    .lean();

  const profileMap = new Map(profiles.map((pr) => [pr.user.toString(), pr]));

  // 4. Combine user and profile data
  let directory = tenantUsers.map((u) => {
    const profile = profileMap.get(u._id.toString());
    const unitDoc = profile?.unit || null;
    const propDoc = profile?.property || (unitDoc ? propertyMap.get(unitDoc.property?.toString()) : null);

    const fullName = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(' ');
    const tenantStatus = profile?.status || (unitDoc ? 'active' : 'pre_added');

    return {
      id: u._id,
      firstName: u.firstName,
      middleName: u.middleName || '',
      lastName: u.lastName,
      name: fullName,
      email: u.email,
      phone: u.phone || '',
      userStatus: u.status,
      status: tenantStatus,
      propertyId: propDoc?._id || null,
      propertyName: propDoc?.name || 'Unassigned',
      property: propDoc
        ? {
            id: propDoc._id,
            name: propDoc.name,
            address: propDoc.address,
            city: propDoc.city,
          }
        : null,
      unitId: unitDoc?._id || null,
      unitLabel: unitDoc?.label || 'Unassigned',
      unit: unitDoc
        ? {
            id: unitDoc._id,
            label: unitDoc.label,
            monthlyRent: unitDoc.monthlyRent,
            bedrooms: unitDoc.bedrooms,
            bathrooms: unitDoc.bathrooms,
            sqft: unitDoc.sqft,
            status: unitDoc.status,
          }
        : null,
      monthlyRent: profile?.monthlyRent ?? unitDoc?.monthlyRent ?? 0,
      leaseStart: profile?.leaseStart ?? unitDoc?.leaseStart ?? null,
      leaseEnd: profile?.leaseEnd ?? unitDoc?.leaseEnd ?? null,
      memberSince: u.createdAt,
    };
  });

  // Calculate summary before search/status filters
  const totalTenants = directory.length;
  const activeLeasesCount = directory.filter((t) => t.status === 'active').length;
  const preAddedCount = directory.filter((t) => t.status === 'pre_added').length;

  // Apply status filter
  if (status && status !== 'all') {
    if (status === 'occupied' || status === 'active') {
      directory = directory.filter((t) => t.status === 'active');
    } else if (status === 'pre_added' || status === 'unassigned') {
      directory = directory.filter((t) => t.status === 'pre_added');
    } else {
      directory = directory.filter((t) => t.status === status);
    }
  }

  // Apply text search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    directory = directory.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.propertyName.toLowerCase().includes(q) ||
        t.unitLabel.toLowerCase().includes(q)
    );
  }

  return {
    summary: {
      totalTenants,
      activeLeasesCount,
      preAddedCount,
    },
    tenants: directory,
  };
}

/**
 * GET detailed information for a single tenant.
 *
 * @param {string} landlordId
 * @param {string} tenantId
 */
async function getTenantDetails(landlordId, tenantId) {
  const tenantUser = await User.findOne({
    _id: tenantId,
    landlord: landlordId,
    role: 'tenant',
  }).select('firstName middleName lastName email phone status createdAt').lean();

  if (!tenantUser) throw new TenantDirectoryError('Tenant not found or unauthorized', 404);

  const profile = await TenantProfile.findOne({ user: tenantId })
    .populate('unit')
    .populate('property')
    .lean();

  const [tickets, payments, documents] = await Promise.all([
    Ticket.find({ tenant: tenantId }).sort({ createdAt: -1 }).limit(10).lean(),
    Payment.find({ tenant: tenantId }).sort({ dueDate: -1 }).limit(10).lean(),
    Document.find({ tenant: tenantId }).sort({ createdAt: -1 }).lean(),
  ]);

  const fullName = [tenantUser.firstName, tenantUser.middleName, tenantUser.lastName].filter(Boolean).join(' ');

  return {
    id: tenantUser._id,
    firstName: tenantUser.firstName,
    middleName: tenantUser.middleName || '',
    lastName: tenantUser.lastName,
    name: fullName,
    email: tenantUser.email,
    phone: tenantUser.phone || '',
    userStatus: tenantUser.status,
    status: profile?.status || 'pre_added',
    leaseStart: profile?.leaseStart || profile?.unit?.leaseStart || null,
    leaseEnd: profile?.leaseEnd || profile?.unit?.leaseEnd || null,
    monthlyRent: profile?.monthlyRent || profile?.unit?.monthlyRent || 0,
    unit: profile?.unit || null,
    property: profile?.property || null,
    memberSince: tenantUser.createdAt,
    tickets,
    payments,
    documents,
  };
}

/**
 * POST / Create a new tenant (active or pre-added).
 *
 * @param {string} landlordId
 * @param {object} data
 * @param {string} ipAddress
 */
async function createTenant(landlordId, data, ipAddress = '') {
  const {
    firstName,
    middleName = '',
    lastName,
    email,
    phone = '',
    unitId,
    monthlyRent,
    leaseStart,
    leaseEnd,
    tempPassword,
  } = data;

  if (!firstName?.trim()) throw new TenantDirectoryError('First name is required', 400);
  if (!lastName?.trim()) throw new TenantDirectoryError('Last name is required', 400);
  if (!email?.trim()) throw new TenantDirectoryError('Email is required', 400);
  if (!EMAIL_REGEX.test(email.trim())) throw new TenantDirectoryError('Invalid email format', 400);

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new TenantDirectoryError('A user with this email address already exists', 409);
  }

  const initialPassword = tempPassword || 'JPTL2026';

  // Create user
  const tenantUser = await User.create({
    firstName: firstName.trim(),
    middleName: middleName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    password: initialPassword,
    role: 'tenant',
    landlord: landlordId,
    status: 'active',
  });

  let assignedUnit = null;
  let assignedProperty = null;

  if (unitId && unitId !== 'pre_add_unassigned') {
    const unit = await Unit.findById(unitId);
    if (!unit) throw new TenantDirectoryError('Specified unit not found', 404);

    const property = await Property.findOne({ _id: unit.property, landlord: landlordId });
    if (!property) throw new TenantDirectoryError('Unit does not belong to your properties', 403);

    if (unit.status === 'occupied') {
      throw new TenantDirectoryError('Specified unit is already occupied', 400);
    }

    unit.tenant = tenantUser._id;
    unit.status = 'occupied';
    if (leaseStart) unit.leaseStart = new Date(leaseStart);
    if (leaseEnd) unit.leaseEnd = new Date(leaseEnd);
    if (monthlyRent) unit.monthlyRent = Number(monthlyRent);
    await unit.save();

    assignedUnit = unit;
    assignedProperty = property;
    await updatePropertyMetrics(property._id);
  }

  const profileStatus = assignedUnit ? 'active' : 'pre_added';
  const profileRent = monthlyRent ? Number(monthlyRent) : assignedUnit ? assignedUnit.monthlyRent : 0;

  const profile = await TenantProfile.create({
    user: tenantUser._id,
    property: assignedProperty ? assignedProperty._id : null,
    unit: assignedUnit ? assignedUnit._id : null,
    monthlyRent: profileRent,
    leaseStart: leaseStart ? new Date(leaseStart) : null,
    leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
    status: profileStatus,
  });

  await logAction({
    actorId: landlordId,
    action: 'TENANT_CREATED_FROM_DIRECTORY',
    entityKind: 'User',
    entityId: tenantUser._id,
    ipAddress,
  });

  const fullName = [tenantUser.firstName, tenantUser.middleName, tenantUser.lastName].filter(Boolean).join(' ');

  // Dispatch welcome email asynchronously
  const landlordUser = await User.findById(landlordId).select('firstName lastName company').lean();
  const landlordName = landlordUser ? [landlordUser.firstName, landlordUser.lastName].filter(Boolean).join(' ') : 'Your Landlord';
  const propertyName = assignedProperty ? assignedProperty.name : 'Your Residence';

  sendTenantWelcomeEmail({
    email: tenantUser.email,
    name: fullName,
    landlordName,
    propertyName,
  }).catch((err) => console.error('Error sending welcome email:', err.message));

  return {
    id: tenantUser._id,
    firstName: tenantUser.firstName,
    middleName: tenantUser.middleName,
    lastName: tenantUser.lastName,
    name: fullName,
    email: tenantUser.email,
    phone: tenantUser.phone,
    role: tenantUser.role,
    temporaryPassword: initialPassword,
    defaultPassword: initialPassword,
    propertyId: assignedProperty?._id || null,
    propertyName: assignedProperty?.name || 'Unassigned',
    unitId: assignedUnit?._id || null,
    unitLabel: assignedUnit?.label || 'Unassigned',
    monthlyRent: profile.monthlyRent,
    leaseStart: profile.leaseStart,
    leaseEnd: profile.leaseEnd,
    status: profile.status,
    createdAt: tenantUser.createdAt,
  };
}

/**
 * PUT / Update tenant information, lease, or unit assignment.
 *
 * @param {string} landlordId
 * @param {string} tenantId
 * @param {object} data
 * @param {string} ipAddress
 */
async function updateTenant(landlordId, tenantId, data, ipAddress = '') {
  const {
    firstName,
    middleName,
    lastName,
    email,
    phone,
    unitId,
    monthlyRent,
    leaseStart,
    leaseEnd,
    status,
  } = data;

  const tenantUser = await User.findOne({
    _id: tenantId,
    landlord: landlordId,
    role: 'tenant',
  });

  if (!tenantUser) throw new TenantDirectoryError('Tenant not found or unauthorized', 404);

  if (email && email.trim().toLowerCase() !== tenantUser.email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) throw new TenantDirectoryError('Invalid email format', 400);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) throw new TenantDirectoryError('Email is already registered to another user', 409);
    tenantUser.email = normalizedEmail;
  }

  if (firstName !== undefined) tenantUser.firstName = firstName.trim();
  if (middleName !== undefined) tenantUser.middleName = middleName.trim();
  if (lastName !== undefined) tenantUser.lastName = lastName.trim();
  if (phone !== undefined) tenantUser.phone = phone.trim();
  await tenantUser.save();

  let profile = await TenantProfile.findOne({ user: tenantId });
  if (!profile) {
    profile = new TenantProfile({ user: tenantId });
  }

  // Handle unit reassignment if unitId provided
  if (unitId !== undefined) {
    const currentUnitId = profile.unit ? profile.unit.toString() : null;

    if (unitId === 'pre_add_unassigned' || unitId === null || unitId === '') {
      // Unassign from current unit
      if (currentUnitId) {
        const oldUnit = await Unit.findById(currentUnitId);
        if (oldUnit) {
          oldUnit.tenant = null;
          oldUnit.status = 'vacant';
          await oldUnit.save();
          await updatePropertyMetrics(oldUnit.property);
        }
      }
      profile.unit = null;
      profile.property = null;
      profile.status = status || 'pre_added';
    } else if (unitId !== currentUnitId) {
      // Moving to a new unit
      const newUnit = await Unit.findById(unitId);
      if (!newUnit) throw new TenantDirectoryError('New unit not found', 404);

      const prop = await Property.findOne({ _id: newUnit.property, landlord: landlordId });
      if (!prop) throw new TenantDirectoryError('New unit does not belong to your properties', 403);
      if (newUnit.status === 'occupied' && newUnit.tenant?.toString() !== tenantId) {
        throw new TenantDirectoryError('Selected unit is already occupied by another tenant', 400);
      }

      // Vacate old unit
      if (currentUnitId) {
        const oldUnit = await Unit.findById(currentUnitId);
        if (oldUnit) {
          oldUnit.tenant = null;
          oldUnit.status = 'vacant';
          await oldUnit.save();
          await updatePropertyMetrics(oldUnit.property);
        }
      }

      // Occupy new unit
      newUnit.tenant = tenantId;
      newUnit.status = 'occupied';
      if (monthlyRent !== undefined) newUnit.monthlyRent = Number(monthlyRent);
      if (leaseStart !== undefined) newUnit.leaseStart = leaseStart ? new Date(leaseStart) : null;
      if (leaseEnd !== undefined) newUnit.leaseEnd = leaseEnd ? new Date(leaseEnd) : null;
      await newUnit.save();
      await updatePropertyMetrics(prop._id);

      profile.unit = newUnit._id;
      profile.property = prop._id;
      profile.status = status || 'active';
    }
  }

  if (monthlyRent !== undefined) profile.monthlyRent = Number(monthlyRent);
  if (leaseStart !== undefined) profile.leaseStart = leaseStart ? new Date(leaseStart) : null;
  if (leaseEnd !== undefined) profile.leaseEnd = leaseEnd ? new Date(leaseEnd) : null;
  if (status !== undefined) profile.status = status;

  await profile.save();

  await logAction({
    actorId: landlordId,
    action: 'TENANT_UPDATED',
    entityKind: 'User',
    entityId: tenantUser._id,
    ipAddress,
  });

  return getTenantDetails(landlordId, tenantId);
}

/**
 * DELETE / Remove tenant or unassign and archive.
 *
 * @param {string} landlordId
 * @param {string} tenantId
 * @param {string} ipAddress
 */
async function deleteTenant(landlordId, tenantId, ipAddress = '') {
  const tenantUser = await User.findOne({
    _id: tenantId,
    landlord: landlordId,
    role: 'tenant',
  });

  if (!tenantUser) throw new TenantDirectoryError('Tenant not found or unauthorized', 404);

  const profile = await TenantProfile.findOne({ user: tenantId });
  if (profile?.unit) {
    const unit = await Unit.findById(profile.unit);
    if (unit) {
      unit.tenant = null;
      unit.status = 'vacant';
      await unit.save();
      await updatePropertyMetrics(unit.property);
    }
  }

  await TenantProfile.deleteOne({ user: tenantId });
  await User.deleteOne({ _id: tenantId });

  await logAction({
    actorId: landlordId,
    action: 'TENANT_DELETED',
    entityKind: 'User',
    entityId: tenantId,
    ipAddress,
  });

  return { message: 'Tenant successfully removed and unit released' };
}

export {
  TenantDirectoryError,
  getTenantDirectory,
  getTenantDetails,
  createTenant,
  updateTenant,
  deleteTenant,
};
