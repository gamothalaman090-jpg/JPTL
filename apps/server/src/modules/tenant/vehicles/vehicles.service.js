import TenantProfile from '../../../shared/models/tenantProfile.model.js';

export async function getTenantVehicles(tenantId) {
  const profile = await TenantProfile.findOne({ user: tenantId }).lean();
  if (!profile) {
    return [];
  }
  return profile.vehicles || [];
}

export async function addTenantVehicle(tenantId, data) {
  const { make, model, color, licensePlate, decalNumber } = data;

  if (!make?.trim() || !licensePlate?.trim()) {
    const error = new Error('Vehicle make and licensePlate are required');
    error.statusCode = 400;
    throw error;
  }

  let profile = await TenantProfile.findOne({ user: tenantId });
  if (!profile) {
    profile = await TenantProfile.create({
      user: tenantId,
      vehicles: [],
    });
  }

  // Prevent duplicate license plates for the same tenant
  const normalizedPlate = licensePlate.trim().toUpperCase();
  const exists = profile.vehicles.some((v) => v.licensePlate.toUpperCase() === normalizedPlate);
  if (exists) {
    const error = new Error('A vehicle with this license plate is already registered');
    error.statusCode = 409;
    throw error;
  }

  const newVehicle = {
    make: make.trim(),
    model: model?.trim() || '',
    color: color?.trim() || '',
    licensePlate: normalizedPlate,
    decalNumber: decalNumber?.trim() || '',
    registeredAt: new Date(),
  };

  profile.vehicles.push(newVehicle);
  await profile.save();

  return profile.vehicles[profile.vehicles.length - 1];
}

export async function deleteTenantVehicle(tenantId, vehicleId) {
  const profile = await TenantProfile.findOne({ user: tenantId });
  if (!profile) {
    const error = new Error('Tenant profile not found');
    error.statusCode = 404;
    throw error;
  }

  const initialLength = profile.vehicles.length;
  profile.vehicles = profile.vehicles.filter((v) => v._id.toString() !== vehicleId);

  if (profile.vehicles.length === initialLength) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  await profile.save();
  return { success: true, message: 'Vehicle registration removed successfully' };
}
