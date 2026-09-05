import * as vehicleService from './vehicles.service.js';

export async function getVehicles(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const vehicles = await vehicleService.getTenantVehicles(tenantId);
    return res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function addVehicle(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const vehicle = await vehicleService.addTenantVehicle(tenantId, req.body);
    return res.status(201).json({ success: true, message: 'Vehicle registered successfully', data: vehicle });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deleteVehicle(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const result = await vehicleService.deleteTenantVehicle(tenantId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
