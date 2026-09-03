import * as propertyService from './properties.service.js';

export async function getProperties(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const properties = await propertyService.getLandlordProperties(landlordId);
    return res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function getPropertyById(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const property = await propertyService.getPropertyById(landlordId, req.params.id);
    return res.status(200).json({ success: true, data: property });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function createProperty(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const property = await propertyService.createProperty(landlordId, req.body, ipAddress);
    return res.status(201).json({ success: true, message: 'Property created successfully', data: property });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function updateProperty(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const property = await propertyService.updateProperty(landlordId, req.params.id, req.body, ipAddress);
    return res.status(200).json({ success: true, message: 'Property updated successfully', data: property });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deleteProperty(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const force = req.query.force === 'true';
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await propertyService.deleteProperty(landlordId, req.params.id, { force, ipAddress });
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function addUnit(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const unit = await propertyService.addUnitToProperty(landlordId, req.params.id, req.body, ipAddress);
    return res.status(201).json({ success: true, message: 'Unit created successfully', data: unit });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deleteUnit(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await propertyService.deleteUnit(landlordId, req.params.propertyId, req.params.unitId, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
