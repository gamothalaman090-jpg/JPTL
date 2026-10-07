import * as ticketService from './tickets.service.js';
import { uploadTicketPhotoToCloudinary } from '../../../shared/config/cloudinary.js';
import { getLandlordScopeId } from '../../../shared/utils/landlordScope.js';

export async function getTickets(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const result = await ticketService.getLandlordTickets(landlordId, req.query);
    return res.status(200).json({ success: true, data: result.tickets, tickets: result.tickets, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function getTicketById(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const ticket = await ticketService.getTicketById(landlordId, req.params.id);
    return res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function createTicket(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const ticket = await ticketService.createLandlordTicket(landlordId, req.body, ipAddress);
    return res.status(201).json({ success: true, message: 'Ticket created successfully', data: ticket });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function updateTicketStatus(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const ticket = await ticketService.updateTicketStatus(landlordId, req.params.id, req.body, ipAddress);
    return res.status(200).json({ success: true, message: 'Ticket status updated', data: ticket });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function assignTechnician(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const ticket = await ticketService.assignTechnician(landlordId, req.params.id, req.body, ipAddress);
    return res.status(200).json({ success: true, message: 'Technician assigned successfully', data: ticket });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function deleteTicket(req, res) {
  try {
    const landlordId = getLandlordScopeId(req.user);
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await ticketService.deleteTicket(landlordId, req.params.id, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

/**
 * POST /landlord/tickets/upload-photos
 * Accepts up to 5 images (multipart field: "photos"), uploads each to
 * Cloudinary under jptl_maintenance_photos, and returns the secure URLs.
 */
export async function uploadPhotos(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No photos provided' });
    }

    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadTicketPhotoToCloudinary(file.buffer, file.originalname)
      )
    );

    const photoUrls = uploads.map((u) => u.secure_url);
    return res.status(200).json({ success: true, photoUrls });
  } catch (err) {
    console.error('Ticket photo upload error:', err.message);
    return res.status(500).json({ success: false, message: 'Photo upload failed: ' + err.message });
  }
}
