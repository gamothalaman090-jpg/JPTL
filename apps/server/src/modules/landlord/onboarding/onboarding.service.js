import crypto from 'crypto';
import User from '../../../shared/models/user.model.js';
import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import TenantProfile from '../../../shared/models/tenantProfile.model.js';
import Announcement from '../../../shared/models/announcements.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import { sendTenantWelcomeEmail } from '../../../shared/utils/mailer.js';

class OnboardingError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PLANS = ['starter', 'pro', 'enterprise'];

/**
 * Generate default temporary password for pre-registered tenants
 */
function generateTemporaryPassword() {
  return 'jptl2026';
}

/**
 * Create an audit log record safely
 */
async function logAction({ actorId, actorRole = 'landlord', action, entityKind, entityId = null, ipAddress = '' }) {
  try {
    await AuditLog.create({
      actor: actorId,
      actorRole,
      action,
      entityKind,
      entityId,
      ipAddress: ipAddress || '',
    });
  } catch (err) {
    // Non-blocking for audit log failure, but log to console
    console.error('Failed to create AuditLog:', err.message);
  }
}

/**
 * Recalculate and update unitsCount and occupancyRate for a property
 */
async function updatePropertyMetrics(propertyId) {
  const totalUnits = await Unit.countDocuments({ property: propertyId });
  const occupiedUnits = await Unit.countDocuments({ property: propertyId, status: 'occupied' });
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  await Property.findByIdAndUpdate(propertyId, {
    unitsCount: totalUnits,
    occupancyRate,
  });
}

/**
 * Get current onboarding status for landlord
 */
async function getOnboardingStatus(landlordId) {
  const landlord = await User.findById(landlordId);
  if (!landlord) {
    throw new OnboardingError('Landlord not found', 404);
  }

  const propertiesCount = await Property.countDocuments({ landlord: landlordId });
  const properties = await Property.find({ landlord: landlordId }).select('_id');
  const propertyIds = properties.map((p) => p._id);

  const unitsCount = await Unit.countDocuments({ property: { $in: propertyIds } });
  const tenantsCount = await User.countDocuments({ landlord: landlordId, role: 'tenant' });
  const hasAnnouncement = (await Announcement.countDocuments({ author: landlordId })) > 0;

  return {
    onboardingCompleted: landlord.onboardingCompleted || false,
    plan: landlord.plan || 'starter',
    summary: {
      propertiesCount,
      unitsCount,
      tenantsCount,
      hasAnnouncement,
    },
  };
}

/**
 * Update portfolio plan
 */
async function updatePlan(landlordId, plan, ipAddress = '') {
  if (!plan || !VALID_PLANS.includes(plan.toLowerCase())) {
    throw new OnboardingError(`Invalid plan. Must be one of: ${VALID_PLANS.join(', ')}`, 400);
  }

  const normalizedPlan = plan.toLowerCase();
  const landlord = await User.findByIdAndUpdate(
    landlordId,
    { plan: normalizedPlan },
    { new: true }
  );

  if (!landlord) {
    throw new OnboardingError('Landlord not found', 404);
  }

  await logAction({
    actorId: landlordId,
    action: 'PORTFOLIO_PLAN_UPDATED',
    entityKind: 'User',
    entityId: landlordId,
    ipAddress,
  });

  return {
    plan: landlord.plan,
    onboardingCompleted: landlord.onboardingCompleted,
  };
}

/**
 * Create a property during onboarding
 */
async function createProperty(landlordId, data, ipAddress = '') {
  const { name, address, city, category, image, featured } = data;

  if (!name?.trim()) throw new OnboardingError('Property name is required', 400);
  if (!address?.trim()) throw new OnboardingError('Property address is required', 400);

  const property = await Property.create({
    name: name.trim(),
    address: address.trim(),
    city: city?.trim() || 'Metro Area',
    category: category || 'Residential',
    image: image || '/images/default-property.jpg',
    featured: Boolean(featured),
    landlord: landlordId,
    unitsCount: 0,
    occupancyRate: 0,
  });

  await logAction({
    actorId: landlordId,
    action: 'PROPERTY_CREATED',
    entityKind: 'Property',
    entityId: property._id,
    ipAddress,
  });

  return property;
}

/**
 * Create a unit during onboarding
 */
async function createUnit(landlordId, data, ipAddress = '') {
  const { propertyId, label, monthlyRent, bedrooms, bathrooms, sqft, status } = data;

  if (!propertyId) throw new OnboardingError('propertyId is required', 400);
  if (!label?.trim()) throw new OnboardingError('Unit label is required', 400);
  if (monthlyRent === undefined || monthlyRent === null || Number(monthlyRent) < 0) {
    throw new OnboardingError('Valid monthlyRent is required', 400);
  }

  // Verify property ownership
  const property = await Property.findOne({ _id: propertyId, landlord: landlordId });
  if (!property) {
    throw new OnboardingError('Property not found or not owned by landlord', 404);
  }

  const unit = await Unit.create({
    label: label.trim(),
    property: property._id,
    monthlyRent: Number(monthlyRent),
    bedrooms: Number(bedrooms) || 0,
    bathrooms: Number(bathrooms) || 1,
    sqft: Number(sqft) || 500,
    status: status || 'vacant',
  });

  await updatePropertyMetrics(property._id);

  await logAction({
    actorId: landlordId,
    action: 'UNIT_CREATED',
    entityKind: 'Unit',
    entityId: unit._id,
    ipAddress,
  });

  return unit;
}

/**
 * Create / Pre-register a tenant during onboarding
 */
async function createTenant(landlordId, data, ipAddress = '') {
  const { firstName, middleName, lastName, email, unitId, tempPassword } = data;

  if (!firstName?.trim()) throw new OnboardingError('firstName is required', 400);
  if (!lastName?.trim()) throw new OnboardingError('lastName is required', 400);

  if (!email?.trim()) {
    throw new OnboardingError('email is required', 400);
  } else if (!EMAIL_REGEX.test(email.trim())) {
    throw new OnboardingError('email is invalid', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new OnboardingError('A user with this email already exists', 409);
  }

  const generatedPassword = tempPassword || generateTemporaryPassword();

  // Create Tenant User account
  const tenantUser = await User.create({
    firstName: firstName.trim(),
    middleName: middleName?.trim() || '',
    lastName: lastName.trim(),
    email: normalizedEmail,
    password: generatedPassword,
    role: 'tenant',
    landlord: landlordId,
    status: 'active',
  });

  let assignedUnit = null;
  let assignedProperty = null;

  if (unitId && unitId !== 'pre_add_unassigned') {
    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw new OnboardingError('Specified unit does not exist', 404);
    }

    // Verify property ownership
    const property = await Property.findOne({ _id: unit.property, landlord: landlordId });
    if (!property) {
      throw new OnboardingError('Specified unit does not belong to your properties', 403);
    }

    if (unit.status === 'occupied') {
      throw new OnboardingError('Specified unit is already occupied', 400);
    }

    unit.tenant = tenantUser._id;
    unit.status = 'occupied';
    await unit.save();

    assignedUnit = unit;
    assignedProperty = property;

    await updatePropertyMetrics(property._id);
  }

  // Create Tenant Profile
  const profile = await TenantProfile.create({
    user: tenantUser._id,
    property: assignedProperty ? assignedProperty._id : null,
    unit: assignedUnit ? assignedUnit._id : null,
    monthlyRent: assignedUnit ? assignedUnit.monthlyRent : 0,
    status: assignedUnit ? 'active' : 'pre_added',
  });

  await logAction({
    actorId: landlordId,
    action: 'TENANT_REGISTERED',
    entityKind: 'User',
    entityId: tenantUser._id,
    ipAddress,
  });

  const landlordUser = await User.findById(landlordId).select('firstName lastName company').lean();
  const landlordName = landlordUser ? [landlordUser.firstName, landlordUser.lastName].filter(Boolean).join(' ') : 'Your Landlord';
  const fullName = [tenantUser.firstName, tenantUser.middleName, tenantUser.lastName].filter(Boolean).join(' ');

  sendTenantWelcomeEmail({
    email: tenantUser.email,
    name: fullName,
    landlordName,
    propertyName: assignedProperty ? assignedProperty.name : 'Your Residence',
    password: generatedPassword || 'jptl2026',
  }).catch((err) => console.error('Error sending welcome email in registerTenant:', err.message));

  return {
    id: tenantUser._id,
    firstName: tenantUser.firstName,
    middleName: tenantUser.middleName,
    lastName: tenantUser.lastName,
    fullName: [tenantUser.firstName, tenantUser.middleName, tenantUser.lastName].filter(Boolean).join(' '),
    email: tenantUser.email,
    role: tenantUser.role,
    temporaryPassword: generatedPassword,
    unitId: assignedUnit ? assignedUnit._id : null,
    unitLabel: assignedUnit ? assignedUnit.label : 'Unassigned',
    propertyId: assignedProperty ? assignedProperty._id : null,
    propertyName: assignedProperty ? assignedProperty.name : 'Unassigned',
    status: profile.status,
  };
}

/**
 * Create welcome announcement during onboarding
 */
async function createWelcomeAnnouncement(landlordId, data, ipAddress = '') {
  const { title, subject, content, body, category, isPinned } = data;
  const announcementTitle = (title || subject || '').trim();
  const announcementContent = (content || body || '').trim();

  if (!announcementTitle) throw new OnboardingError('Announcement title/subject is required', 400);
  if (!announcementContent) throw new OnboardingError('Announcement content/body is required', 400);

  const announcement = await Announcement.create({
    title: announcementTitle,
    content: announcementContent,
    category: category || 'General',
    isPinned: isPinned !== undefined ? Boolean(isPinned) : true,
    author: landlordId,
  });

  await logAction({
    actorId: landlordId,
    action: 'WELCOME_ANNOUNCEMENT_CREATED',
    entityKind: 'Announcement',
    entityId: announcement._id,
    ipAddress,
  });

  return announcement;
}

/**
 * Complete full onboarding in one batch execution
 * Resolves temporary IDs between properties, units, and tenants
 */
async function completeFullOnboarding(landlordId, payload, ipAddress = '') {
  const landlord = await User.findById(landlordId);
  if (!landlord) {
    throw new OnboardingError('Landlord not found', 404);
  }

  const {
    plan = 'starter',
    properties = [],
    units = [],
    tenants = [],
    announcement = null,
  } = payload || {};

  // 1. Update Portfolio Plan and Mark Onboarding Completed
  const selectedPlan = VALID_PLANS.includes(String(plan).toLowerCase()) ? String(plan).toLowerCase() : 'starter';
  landlord.plan = selectedPlan;
  landlord.onboardingCompleted = true;
  await landlord.save();

  // 2. Map of temporary/input IDs to database ObjectIds
  const propertyIdMap = new Map(); // tempId -> created Property ObjectId
  const unitIdMap = new Map();     // tempId -> created Unit ObjectId

  const createdProperties = [];
  const createdUnits = [];
  const createdTenants = [];

  // 3. Process Properties
  for (const prop of properties) {
    if (!prop.name?.trim() || !prop.address?.trim()) continue;

    const createdProp = await Property.create({
      name: prop.name.trim(),
      address: prop.address.trim(),
      city: prop.city?.trim() || 'Metro Area',
      category: prop.category || 'Residential',
      image: prop.image || '/images/default-property.jpg',
      featured: Boolean(prop.featured),
      landlord: landlordId,
      unitsCount: 0,
      occupancyRate: 0,
    });

    createdProperties.push(createdProp);
    if (prop.tempId) propertyIdMap.set(prop.tempId, createdProp._id);
    if (prop.id) propertyIdMap.set(prop.id, createdProp._id);

    await logAction({
      actorId: landlordId,
      action: 'PROPERTY_CREATED',
      entityKind: 'Property',
      entityId: createdProp._id,
      ipAddress,
    });
  }

  // 4. Process Units
  for (const unit of units) {
    if (!unit.label?.trim() || unit.monthlyRent === undefined) continue;

    // Resolve propertyId from map or direct reference
    let resolvedPropertyId = unit.propertyId;
    if (unit.propertyTempId && propertyIdMap.has(unit.propertyTempId)) {
      resolvedPropertyId = propertyIdMap.get(unit.propertyTempId);
    } else if (unit.propertyId && propertyIdMap.has(unit.propertyId)) {
      resolvedPropertyId = propertyIdMap.get(unit.propertyId);
    }

    if (!resolvedPropertyId && createdProperties.length > 0) {
      resolvedPropertyId = createdProperties[0]._id;
    }

    if (!resolvedPropertyId) continue;

    const createdUnit = await Unit.create({
      label: unit.label.trim(),
      property: resolvedPropertyId,
      monthlyRent: Number(unit.monthlyRent) || 0,
      bedrooms: Number(unit.bedrooms) || 0,
      bathrooms: Number(unit.bathrooms) || 1,
      sqft: Number(unit.sqft) || 500,
      status: unit.status || 'vacant',
    });

    createdUnits.push(createdUnit);
    if (unit.tempId) unitIdMap.set(unit.tempId, createdUnit._id);
    if (unit.id) unitIdMap.set(unit.id, createdUnit._id);

    await logAction({
      actorId: landlordId,
      action: 'UNIT_CREATED',
      entityKind: 'Unit',
      entityId: createdUnit._id,
      ipAddress,
    });
  }

  // 5. Process Tenants
  for (const tenant of tenants) {
    const firstName = (tenant.firstName || '').trim();
    const lastName = (tenant.lastName || '').trim();
    const middleName = (tenant.middleName || '').trim();
    const email = (tenant.email || '').trim().toLowerCase();

    if (!firstName || !lastName || !email || !EMAIL_REGEX.test(email)) continue;

    // Check if email already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) continue;

    const tempPassword = tenant.tempPassword || generateTemporaryPassword();

    const tenantUser = await User.create({
      firstName,
      middleName,
      lastName,
      email,
      password: tempPassword,
      role: 'tenant',
      landlord: landlordId,
      status: 'active',
    });

    // Resolve assigned unit
    let resolvedUnitId = tenant.unitId;
    if (tenant.unitTempId && unitIdMap.has(tenant.unitTempId)) {
      resolvedUnitId = unitIdMap.get(tenant.unitTempId);
    } else if (tenant.unitId && unitIdMap.has(tenant.unitId)) {
      resolvedUnitId = unitIdMap.get(tenant.unitId);
    }

    let assignedUnit = null;
    let assignedProperty = null;

    if (resolvedUnitId && resolvedUnitId !== 'pre_add_unassigned') {
      assignedUnit = await Unit.findById(resolvedUnitId);
      if (assignedUnit) {
        assignedUnit.tenant = tenantUser._id;
        assignedUnit.status = 'occupied';
        await assignedUnit.save();
        assignedProperty = await Property.findById(assignedUnit.property);
      }
    }

    const profile = await TenantProfile.create({
      user: tenantUser._id,
      property: assignedProperty ? assignedProperty._id : null,
      unit: assignedUnit ? assignedUnit._id : null,
      monthlyRent: assignedUnit ? assignedUnit.monthlyRent : 0,
      status: assignedUnit ? 'active' : 'pre_added',
    });

    createdTenants.push({
      id: tenantUser._id,
      firstName: tenantUser.firstName,
      middleName: tenantUser.middleName,
      lastName: tenantUser.lastName,
      fullName: [tenantUser.firstName, tenantUser.middleName, tenantUser.lastName].filter(Boolean).join(' '),
      email: tenantUser.email,
      role: tenantUser.role,
      temporaryPassword: tempPassword,
      unitId: assignedUnit ? assignedUnit._id : null,
      unitLabel: assignedUnit ? assignedUnit.label : 'Unassigned',
      propertyId: assignedProperty ? assignedProperty._id : null,
      propertyName: assignedProperty ? assignedProperty.name : 'Unassigned',
      status: profile.status,
    });

    await logAction({
      actorId: landlordId,
      action: 'TENANT_REGISTERED',
      entityKind: 'User',
      entityId: tenantUser._id,
      ipAddress,
    });

    const landlordName = [landlord.firstName, landlord.lastName].filter(Boolean).join(' ') || 'Your Landlord';
    sendTenantWelcomeEmail({
      email: tenantUser.email,
      name: fullName,
      landlordName,
      propertyName: assignedProperty ? assignedProperty.name : 'Your Residence',
      password: tempPassword || 'jptl2026',
    }).catch((err) => console.error('Error sending welcome email in completeFullOnboarding:', err.message));
  }

  // 6. Recalculate Property Metrics for all modified properties
  const allPropertyIds = [
    ...new Set([
      ...createdProperties.map((p) => p._id.toString()),
      ...createdUnits.map((u) => u.property.toString()),
    ]),
  ];

  for (const pId of allPropertyIds) {
    await updatePropertyMetrics(pId);
  }

  // 7. Process Welcome Announcement if provided
  let createdAnnouncement = null;
  const announcementTitle = (announcement?.title || announcement?.subject || '').trim();
  const announcementContent = (announcement?.content || announcement?.body || '').trim();

  if (announcementTitle && announcementContent) {
    createdAnnouncement = await Announcement.create({
      title: announcementTitle,
      content: announcementContent,
      category: announcement.category || 'General',
      isPinned: announcement.isPinned !== undefined ? Boolean(announcement.isPinned) : true,
      author: landlordId,
    });

    await logAction({
      actorId: landlordId,
      action: 'WELCOME_ANNOUNCEMENT_CREATED',
      entityKind: 'Announcement',
      entityId: createdAnnouncement._id,
      ipAddress,
    });
  }

  // 8. Overall Onboarding Audit Log
  await logAction({
    actorId: landlordId,
    action: 'ONBOARDING_COMPLETED',
    entityKind: 'Onboarding',
    entityId: null,
    ipAddress,
  });

  return {
    onboardingCompleted: true,
    plan: selectedPlan,
    properties: createdProperties,
    units: createdUnits,
    tenants: createdTenants,
    announcement: createdAnnouncement,
    summary: {
      propertiesCreated: createdProperties.length,
      unitsCreated: createdUnits.length,
      tenantsCreated: createdTenants.length,
      hasAnnouncement: Boolean(createdAnnouncement),
    },
  };
}

export {
  OnboardingError,
  getOnboardingStatus,
  updatePlan,
  createProperty,
  createUnit,
  createTenant,
  createWelcomeAnnouncement,
  completeFullOnboarding,
};
