import * as vendorService from './vendors.service.js';

export async function getVendors(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const vendors = await vendorService.getLandlordVendors(landlordId, req.query);
    return res.status(200).json({ success: true, count: vendors.length, data: vendors });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function createVendor(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const vendor = await vendorService.createVendor(landlordId, req.body);
    return res.status(201).json({ success: true, message: 'Vendor added successfully', data: vendor });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function updateVendor(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const vendor = await vendorService.updateVendor(landlordId, req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Vendor updated successfully', data: vendor });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deleteVendor(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const result = await vendorService.deleteVendor(landlordId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
