import mongoose from 'mongoose';
import User from '../../../shared/models/user.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import Ticket from '../../../shared/models/ticket.model.js';
import Payment from '../../../shared/models/payment.model.js';
import Document from '../../../shared/models/document.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import Lease from '../../../shared/models/lease.model.js';
import crypto from 'crypto';
import { sendTenantWelcomeEmail } from '../../../shared/utils/mailer.js';

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
async function getTenantDirectory(landlordId, query = {}, context = {}) {
  const { search = '', status = 'all', propertyId = '' } = query;

  // 1. Find all properties belonging to this landlord
  const landlordProperties = context.properties || (await Property.find({ landlord: landlordId }).lean());
  const propertyIds = context.propertyIds || landlordProperties.map((p) => p._id);
  const propertyMap = new Map(landlordProperties.map((p) => [p._id.toString(), p]));

  // 2. Find all tenant users registered under this landlord
  const tenantUsers = context.tenants || (await User.find({
    landlord: landlordId,
    role: 'tenant',
  }).select('firstName middleName lastName email phone status createdAt').lean());

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

  // 4. Fetch active leases for these tenants so we always show the up-to-date leaseEnd
  //    (TenantProfile.leaseEnd is NOT updated when a lease extension is approved;
  //     only the Lease document itself gets updated.)
  const leases = await Lease.find({
    tenant: { $in: tenantUserIds },
    landlord: landlordId,
    status: { $in: ['active', 'renewal_pending', 'renewal_approved'] },
  })
    .select('tenant leaseStart leaseEnd leaseType monthlyRent status')
    .lean();

  const leaseMap = new Map(leases.map((l) => [l.tenant.toString(), l]));

  let directory = tenantUsers.map((u) => {
    const profile = profileMap.get(u._id.toString());
    const activeLease = leaseMap.get(u._id.toString()) || null;
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
      hasParking: profile?.hasParking ?? unitDoc?.hasParking ?? false,
      parkingSpot: profile?.parkingSpot ?? unitDoc?.parkingSpot ?? null,
      parkingFee: profile?.parkingFee ?? unitDoc?.parkingFee ?? 0,
      securityDeposit: profile?.securityDeposit ?? (profile?.monthlyRent ? profile.monthlyRent * 1.5 : 0),
      leaseStart: activeLease?.leaseStart ?? profile?.leaseStart ?? unitDoc?.leaseStart ?? null,
      leaseEnd:   activeLease?.leaseEnd   ?? profile?.leaseEnd   ?? unitDoc?.leaseEnd   ?? null,
      leaseType: activeLease?.leaseType || profile?.leaseType || unitDoc?.leaseType || (activeLease?.leaseEnd || profile?.leaseEnd || unitDoc?.leaseEnd ? 'fixed_term' : 'indefinite'),
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
    leaseType: profile?.leaseType || profile?.unit?.leaseType || (profile?.leaseEnd || profile?.unit?.leaseEnd ? 'fixed_term' : 'indefinite'),
    monthlyRent: profile?.monthlyRent || profile?.unit?.monthlyRent || 0,
    hasParking: profile?.hasParking ?? profile?.unit?.hasParking ?? false,
    parkingSpot: profile?.parkingSpot ?? profile?.unit?.parkingSpot ?? null,
    parkingFee: profile?.parkingFee ?? profile?.unit?.parkingFee ?? 0,
    securityDeposit: profile?.securityDeposit ?? (profile?.monthlyRent ? profile.monthlyRent * 1.5 : 0),
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
    hasParking = false,
    parkingSpot = null,
    parkingFee = 0,
    securityDeposit,
    leaseStart,
    leaseEnd,
    leaseType = 'fixed_term',
    tempPassword,
  } = data;

  if (!firstName?.trim()) throw new TenantDirectoryError('First name is required', 400);
  if (!lastName?.trim()) throw new TenantDirectoryError('Last name is required', 400);
  if (!email?.trim()) throw new TenantDirectoryError('Email is required', 400);
  if (!EMAIL_REGEX.test(email.trim())) throw new TenantDirectoryError('Invalid email format', 400);
  if (!['fixed_term', 'indefinite'].includes(leaseType)) throw new TenantDirectoryError('Lease type must be fixed_term or indefinite.', 400);
  if (unitId && unitId !== 'pre_add_unassigned') {
    if (!leaseStart) throw new TenantDirectoryError('Lease start date is required for an assigned unit.', 400);
    if (leaseType === 'fixed_term' && (!leaseEnd || new Date(leaseEnd) <= new Date(leaseStart))) throw new TenantDirectoryError('A fixed-term lease requires an expiration date after its start date.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new TenantDirectoryError('A user with this email address already exists', 409);
  }

  const generatedPassword = tempPassword || generateTemporaryPassword();

  // Create user
  const tenantUser = await User.create({
    firstName: firstName.trim(),
    middleName: middleName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    password: generatedPassword,
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
    unit.leaseType = leaseType;
    unit.leaseEnd = leaseType === 'indefinite' || !leaseEnd ? null : new Date(leaseEnd);
    if (monthlyRent) unit.monthlyRent = Number(monthlyRent);
    if (hasParking !== undefined) {
      unit.hasParking = Boolean(hasParking);
      unit.parkingSpot = hasParking ? parkingSpot : null;
      unit.parkingFee = hasParking ? Number(parkingFee || 0) : 0;
    }
    await unit.save();

    assignedUnit = unit;
    assignedProperty = property;
    await updatePropertyMetrics(property._id);
  }

  const profileStatus = assignedUnit ? 'active' : 'pre_added';
  const profileRent = monthlyRent ? Number(monthlyRent) : assignedUnit ? assignedUnit.monthlyRent : 0;
  const depositAmount = securityDeposit !== undefined ? Number(securityDeposit) : (profileRent ? profileRent * 1.5 : 0);

  const profile = await TenantProfile.create({
    user: tenantUser._id,
    property: assignedProperty ? assignedProperty._id : null,
    unit: assignedUnit ? assignedUnit._id : null,
    monthlyRent: profileRent,
    hasParking: Boolean(hasParking),
    parkingSpot: hasParking ? parkingSpot : null,
    parkingFee: hasParking ? Number(parkingFee || 0) : 0,
    securityDeposit: depositAmount,
    leaseStart: leaseStart ? new Date(leaseStart) : null,
    leaseType,
    leaseEnd: leaseType === 'indefinite' || !leaseEnd ? null : new Date(leaseEnd),
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

  // Send welcome email with login credentials
  try {
    const landlordUser = await User.findById(landlordId).select('firstName lastName').lean();
    const landlordName = landlordUser
      ? [landlordUser.firstName, landlordUser.lastName].filter(Boolean).join(' ')
      : 'Your Landlord';
    const propertyName = assignedProperty?.name || 'your community';

    sendTenantWelcomeEmail({
      email: tenantUser.email,
      name: fullName,
      landlordName,
      propertyName,
      password: generatedPassword,
    }).catch((err) => console.error('Error sending tenant welcome email:', err.message));
  } catch (err) {
    console.error('Failed to initiate welcome email:', err.message);
  }

  return {
    id: tenantUser._id,
    firstName: tenantUser.firstName,
    middleName: tenantUser.middleName,
    lastName: tenantUser.lastName,
    name: fullName,
    email: tenantUser.email,
    phone: tenantUser.phone,
    role: tenantUser.role,
    temporaryPassword: generatedPassword,
    propertyId: assignedProperty?._id || null,
    propertyName: assignedProperty?.name || 'Unassigned',
    unitId: assignedUnit?._id || null,
    unitLabel: assignedUnit?.label || 'Unassigned',
    monthlyRent: profile.monthlyRent,
    hasParking: profile.hasParking,
    parkingSpot: profile.parkingSpot,
    parkingFee: profile.parkingFee,
    leaseStart: profile.leaseStart,
    leaseType: profile.leaseType || 'fixed_term',
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
    hasParking,
    parkingSpot,
    parkingFee,
    securityDeposit,
    leaseStart,
    leaseEnd,
    leaseType,
    status,
  } = data;

  let tenantUser = null;

  if (tenantId && mongoose.Types.ObjectId.isValid(tenantId)) {
    tenantUser = await User.findOne({
      _id: tenantId,
      landlord: landlordId,
      role: 'tenant',
    });
  }

  // If not found by ObjectId or tenantId was synthetic (e.g. usr-tenant-...), try searching by email
  if (!tenantUser && email) {
    tenantUser = await User.findOne({
      email: email.trim().toLowerCase(),
      landlord: landlordId,
      role: 'tenant',
    });
  }

  // If still not found and we have an email, auto-create the tenant
  if (!tenantUser) {
    if (email) {
      return await createTenant(
        landlordId,
        {
          firstName: firstName || 'Resident',
          middleName: middleName || '',
          lastName: lastName || 'Tenant',
          email,
          phone: phone || '',
          unitId,
          monthlyRent,
          leaseStart,
          leaseEnd,
          leaseType,
          tempPassword: 'jptl2026',
        },
        ipAddress
      );
    }
    throw new TenantDirectoryError('Tenant not found or unauthorized', 404);
  }

  const effectiveTenantId = tenantUser._id.toString();

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

  let profile = await TenantProfile.findOne({ user: effectiveTenantId });
  if (!profile) {
    profile = new TenantProfile({ user: effectiveTenantId });
  }

  const wasPreviouslyUnassigned = !profile.unit;
  if (leaseType !== undefined && !['fixed_term', 'indefinite'].includes(leaseType)) throw new TenantDirectoryError('Lease type must be fixed_term or indefinite.', 400);
  const willHaveUnit = unitId !== undefined ? Boolean(unitId && unitId !== 'pre_add_unassigned') : Boolean(profile.unit);
  const effectiveLeaseType = leaseType || profile.leaseType || 'fixed_term';
  const effectiveLeaseStart = leaseStart !== undefined ? leaseStart : profile.leaseStart;
  const effectiveLeaseEnd = effectiveLeaseType === 'indefinite' ? null : leaseEnd !== undefined ? leaseEnd : profile.leaseEnd;
  const leaseWasEdited = unitId !== undefined || leaseType !== undefined || leaseStart !== undefined || leaseEnd !== undefined;
  if (leaseWasEdited && willHaveUnit && !effectiveLeaseStart) throw new TenantDirectoryError('Lease start date is required for an assigned unit.', 400);
  if (leaseWasEdited && willHaveUnit && effectiveLeaseType === 'fixed_term' && (!effectiveLeaseEnd || new Date(effectiveLeaseEnd) <= new Date(effectiveLeaseStart))) throw new TenantDirectoryError('A fixed-term lease requires an expiration date after its start date.', 400);

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
          oldUnit.leaseStart = null;
          oldUnit.leaseType = 'fixed_term';
          oldUnit.leaseEnd = null;
          await oldUnit.save();
          await updatePropertyMetrics(oldUnit.property);
        }
      }
      await Lease.updateMany({ tenant: effectiveTenantId, status: { $ne: 'ended' } }, { $set: { status: 'ended' } });
      profile.unit = null;
      profile.property = null;
      profile.status = status || 'pre_added';
    } else if (unitId !== currentUnitId) {
      // Moving to a new unit
      const newUnit = await Unit.findById(unitId);
      if (!newUnit) throw new TenantDirectoryError('New unit not found', 404);

      const prop = await Property.findOne({ _id: newUnit.property, landlord: landlordId });
      if (!prop) throw new TenantDirectoryError('New unit does not belong to your properties', 403);
      if (newUnit.status === 'occupied' && newUnit.tenant?.toString() !== effectiveTenantId) {
        throw new TenantDirectoryError('Selected unit is already occupied by another tenant', 400);
      }

      // Vacate old unit
      if (currentUnitId) {
        const oldUnit = await Unit.findById(currentUnitId);
        if (oldUnit) {
          oldUnit.tenant = null;
          oldUnit.status = 'vacant';
          oldUnit.leaseStart = null;
          oldUnit.leaseType = 'fixed_term';
          oldUnit.leaseEnd = null;
          await oldUnit.save();
          await updatePropertyMetrics(oldUnit.property);
        }
      }

      // Occupy new unit
      newUnit.tenant = effectiveTenantId;
      newUnit.status = 'occupied';
      if (monthlyRent !== undefined) newUnit.monthlyRent = Number(monthlyRent);
      if (leaseStart !== undefined) newUnit.leaseStart = leaseStart ? new Date(leaseStart) : null;
      if (leaseType !== undefined) newUnit.leaseType = leaseType;
      if (leaseEnd !== undefined || leaseType === 'indefinite') newUnit.leaseEnd = leaseType === 'indefinite' || !leaseEnd ? null : new Date(leaseEnd);
      await newUnit.save();
      await updatePropertyMetrics(prop._id);

      profile.unit = newUnit._id;
      profile.property = prop._id;
      profile.status = status || 'active';

      // If tenant was unassigned before, send welcome credentials email
      if (wasPreviouslyUnassigned) {
        const landlordUser = await User.findById(landlordId).select('firstName lastName company').lean();
        const landlordName = landlordUser ? [landlordUser.firstName, landlordUser.lastName].filter(Boolean).join(' ') : 'Your Landlord';
        const fullName = [tenantUser.firstName, tenantUser.middleName, tenantUser.lastName].filter(Boolean).join(' ');
        sendTenantWelcomeEmail({
          email: tenantUser.email,
          name: fullName,
          landlordName,
          propertyName: prop.name,
          password: 'jptl2026',
        }).catch((err) => console.error('Error sending welcome email on lease assignment:', err.message));
      }
    }
  }

  if (monthlyRent !== undefined) profile.monthlyRent = Number(monthlyRent);
  if (hasParking !== undefined) profile.hasParking = Boolean(hasParking);
  if (parkingSpot !== undefined) profile.parkingSpot = hasParking ? parkingSpot : null;
  if (parkingFee !== undefined) profile.parkingFee = hasParking ? Number(parkingFee || 0) : 0;
  if (securityDeposit !== undefined) profile.securityDeposit = Number(securityDeposit);
  if (leaseStart !== undefined) profile.leaseStart = leaseStart ? new Date(leaseStart) : null;
  if (leaseType !== undefined) profile.leaseType = leaseType;
  if (leaseEnd !== undefined || leaseType === 'indefinite') profile.leaseEnd = leaseType === 'indefinite' || !leaseEnd ? null : new Date(leaseEnd);

  if (profile.unit) {
    const assignedUnit = await Unit.findById(profile.unit);
    if (assignedUnit) {
      assignedUnit.leaseType = profile.leaseType || 'fixed_term';
      if (leaseStart !== undefined) assignedUnit.leaseStart = profile.leaseStart;
      if (leaseEnd !== undefined || leaseType === 'indefinite') assignedUnit.leaseEnd = profile.leaseType === 'indefinite' ? null : profile.leaseEnd;
      if (monthlyRent !== undefined) assignedUnit.monthlyRent = Number(monthlyRent);
      await assignedUnit.save();
    }
    const activeLease = await Lease.findOne({ tenant: effectiveTenantId, status: { $ne: 'ended' } });
    if (activeLease) {
      activeLease.unit = profile.unit;
      activeLease.property = profile.property;
      activeLease.landlord = landlordId;
      activeLease.leaseType = profile.leaseType || 'fixed_term';
      if (leaseStart !== undefined) activeLease.leaseStart = profile.leaseStart;
      if (leaseEnd !== undefined || leaseType === 'indefinite') activeLease.leaseEnd = activeLease.leaseType === 'indefinite' ? null : profile.leaseEnd;
      if (monthlyRent !== undefined) activeLease.monthlyRent = Number(monthlyRent);
      await activeLease.save();
    }
  }
  if (status !== undefined) profile.status = status;

  await profile.save();

  await logAction({
    actorId: landlordId,
    action: 'TENANT_UPDATED',
    entityKind: 'User',
    entityId: tenantUser._id,
    ipAddress,
  });

  return getTenantDetails(landlordId, effectiveTenantId);
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
