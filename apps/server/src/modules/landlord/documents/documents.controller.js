import * as landlordDocService from './documents.service.js';

export async function getDocuments(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const result = await landlordDocService.getLandlordDocuments(landlordId, req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function verifyDocument(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await landlordDocService.verifyDocument(landlordId, req.params.id, req.body, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deleteDocument(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await landlordDocService.deleteDocument(landlordId, req.params.id, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function publishPolicy(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await landlordDocService.publishBuildingPolicy(landlordId, req.body, ipAddress);
    return res.status(201).json({ success: true, message: 'Policy published successfully', data: result });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
