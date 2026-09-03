import Property from '../../../shared/models/property.model.js';
import Unit from '../../../shared/models/unit.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';

export class PropertyError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function logAction({ actorId, action, entityKind, entityId, beforeState = null, afterState = null, ipAddress = '' }) {
  try {
    await AuditLog.create({
      actor: actorId,
      actorRole: 'landlord',
      action,
      entityKind,
      entityId,
      beforeState,
      afterState,
      ipAddress,
    });
  } catch (err) {
    console.error('Property AuditLog error:', err.message);
  }
}

/**
 * Recalculate unitsCount and occupancyRate for a property
 */
export async function updatePropertyMetrics(propertyId) {
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
 * GET all properties for the authenticated landlord
 */
export async function getLandlordProperties(landlordId) {
  const properties = await Property.find({ landlord: landlordId }).sort({ createdAt: -1 }).lean();
  const propertyIds = properties.map((p) => p._id);

  const units = await Unit.find({ property: { $in: propertyIds } }).lean();

  const propertiesWithUnits = properties.map((prop) => {
    const propUnits = units.filter((u) => u.property.toString() === prop._id.toString());
    const occupiedUnits = propUnits.filter((u) => u.status === 'occupied').length;
    const totalRentValue = propUnits.reduce((sum, u) => sum + (u.monthlyRent || 0), 0);

    return {
      ...prop,
      id: prop._id,
      unitsCount: propUnits.length,
      occupancyRate: propUnits.length > 0 ? Math.round((occupiedUnits / propUnits.length) * 100) : 0,
      totalRentValue,
      units: propUnits.map((u) => ({ ...u, id: u._id })),
    };
  });

  return propertiesWithUnits;
}

/**
 * GET single property by ID
 */
export async function getPropertyById(landlordId, propertyId) {
  const property = await Property.findOne({ _id: propertyId, landlord: landlordId }).lean();
  if (!property) {
    throw new PropertyError('Property not found or access denied', 404);
  }

  const units = await Unit.find({ property: propertyId }).populate('tenant', 'name email').lean();

  return {
    ...property,
    id: property._id,
    units: units.map((u) => ({
      ...u,
      id: u._id,
      tenantName: u.tenant?.name || null,
      tenantEmail: u.tenant?.email || null,
    })),
  };
}

/**
 * CREATE a new property
 */
export async function createProperty(landlordId, payload, ipAddress = '') {
  const { name, address, city, category, image } = payload;

  if (!name?.trim()) throw new PropertyError('Property name is required', 400);
  if (!address?.trim()) throw new PropertyError('Address is required', 400);

  const property = await Property.create({
    landlord: landlordId,
    name: name.trim(),
    address: address.trim(),
    city: city?.trim() || 'Metro Area',
    category: category || 'Residential',
    image: image || '/images/default-property.jpg',
    unitsCount: 0,
    occupancyRate: 0,
  });

  await logAction({
    actorId: landlordId,
    action: 'PROPERTY_CREATED',
    entityKind: 'Property',
    entityId: property._id,
    afterState: property.toObject(),
    ipAddress,
  });

  return {
    ...property.toObject(),
    id: property._id,
  };
}

/**
 * UPDATE a property
 */
export async function updateProperty(landlordId, propertyId, payload, ipAddress = '') {
  const property = await Property.findOne({ _id: propertyId, landlord: landlordId });
  if (!property) {
    throw new PropertyError('Property not found or access denied', 404);
  }

  const beforeState = property.toObject();

  if (payload.name) property.name = payload.name.trim();
  if (payload.address) property.address = payload.address.trim();
  if (payload.city) property.city = payload.city.trim();
  if (payload.category) property.category = payload.category;
  if (payload.image) property.image = payload.image;
  if (payload.featured !== undefined) property.featured = Boolean(payload.featured);

  await property.save();

  await logAction({
    actorId: landlordId,
    action: 'PROPERTY_UPDATED',
    entityKind: 'Property',
    entityId: property._id,
    beforeState,
    afterState: property.toObject(),
    ipAddress,
  });

  return {
    ...property.toObject(),
    id: property._id,
  };
}

/**
 * DELETE a property (+ cascade vacant units or enforce safety check)
 */
export async function deleteProperty(landlordId, propertyId, { force = false, ipAddress = '' } = {}) {
  const property = await Property.findOne({ _id: propertyId, landlord: landlordId });
  if (!property) {
    throw new PropertyError('Property not found or access denied', 404);
  }

  const units = await Unit.find({ property: propertyId });
  const occupiedUnits = units.filter((u) => u.status === 'occupied' || u.tenant);

  if (occupiedUnits.length > 0 && !force) {
    throw new PropertyError(
      `Cannot delete property "${property.name}" because it has ${occupiedUnits.length} occupied unit(s). Please vacate or reassign tenants before deleting.`,
      400
    );
  }

  const beforeState = {
    property: property.toObject(),
    unitsCount: units.length,
    occupiedUnitsCount: occupiedUnits.length,
  };

  // Delete all units under this property
  const deleteUnitsResult = await Unit.deleteMany({ property: propertyId });

  // Delete property
  await Property.findByIdAndDelete(propertyId);

  // Write audit log
  await logAction({
    actorId: landlordId,
    action: 'PROPERTY_DELETED',
    entityKind: 'Property',
    entityId: propertyId,
    beforeState,
    afterState: null,
    ipAddress,
  });

  return {
    success: true,
    message: `Property "${property.name}" and ${deleteUnitsResult.deletedCount} associated unit(s) were successfully deleted.`,
    deletedPropertyId: propertyId,
    deletedUnitsCount: deleteUnitsResult.deletedCount,
  };
}

/**
 * ADD a Unit to a property
 */
export async function addUnitToProperty(landlordId, propertyId, payload, ipAddress = '') {
  const property = await Property.findOne({ _id: propertyId, landlord: landlordId });
  if (!property) {
    throw new PropertyError('Property not found or access denied', 404);
  }

  const { label, monthlyRent, bedrooms = 1, bathrooms = 1, sqft = 800 } = payload;
  if (!label?.trim()) throw new PropertyError('Unit label is required (e.g. Unit 4B)', 400);
  if (!monthlyRent || Number(monthlyRent) <= 0) throw new PropertyError('Valid monthly rent is required', 400);

  const unit = await Unit.create({
    property: propertyId,
    label: label.trim(),
    monthlyRent: Number(monthlyRent),
    bedrooms: Number(bedrooms) || 0,
    bathrooms: Number(bathrooms) || 1,
    sqft: Number(sqft) || 500,
    status: 'vacant',
  });

  await updatePropertyMetrics(propertyId);

  await logAction({
    actorId: landlordId,
    action: 'UNIT_CREATED',
    entityKind: 'Unit',
    entityId: unit._id,
    afterState: unit.toObject(),
    ipAddress,
  });

  return {
    ...unit.toObject(),
    id: unit._id,
  };
}

/**
 * DELETE a Unit
 */
export async function deleteUnit(landlordId, propertyId, unitId, ipAddress = '') {
  const property = await Property.findOne({ _id: propertyId, landlord: landlordId });
  if (!property) {
    throw new PropertyError('Property not found or access denied', 404);
  }

  const unit = await Unit.findOne({ _id: unitId, property: propertyId });
  if (!unit) {
    throw new PropertyError('Unit not found', 404);
  }

  if (unit.status === 'occupied' || unit.tenant) {
    throw new PropertyError('Cannot delete unit with an active tenant. Reassign tenant first.', 400);
  }

  const beforeState = unit.toObject();
  await Unit.findByIdAndDelete(unitId);
  await updatePropertyMetrics(propertyId);

  await logAction({
    actorId: landlordId,
    action: 'UNIT_DELETED',
    entityKind: 'Unit',
    entityId: unitId,
    beforeState,
    afterState: null,
    ipAddress,
  });

  return {
    success: true,
    message: `Unit "${unit.label}" deleted successfully.`,
    deletedUnitId: unitId,
  };
}
