import * as tenantDirectoryService from './tenantdirectory.service.js';

export async function getTenantDirectory(req, res) {
  try {
    const landlordId = req.user.id;
    const result = await tenantDirectoryService.getTenantDirectory(landlordId, req.query);
    return res.status(200).json({
      success: true,
      summary: result.summary,
      count: result.tenants.length,
      data: result.tenants,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function getTenantDetails(req, res) {
  try {
    const landlordId = req.user.id;
    const { id } = req.params;
    const tenant = await tenantDirectoryService.getTenantDetails(landlordId, id);
    return res.status(200).json({ success: true, data: tenant });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function createTenant(req, res) {
  try {
    const landlordId = req.user.id;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const tenant = await tenantDirectoryService.createTenant(landlordId, req.body, ipAddress);
    return res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: tenant,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function updateTenant(req, res) {
  try {
    const landlordId = req.user.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const updated = await tenantDirectoryService.updateTenant(landlordId, id, req.body, ipAddress);
    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: updated,
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deleteTenant(req, res) {
  try {
    const landlordId = req.user.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const result = await tenantDirectoryService.deleteTenant(landlordId, id, ipAddress);
    return res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
