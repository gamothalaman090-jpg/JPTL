import * as ticketService from './tickets.service.js';

export async function getTickets(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const result = await ticketService.getLandlordTickets(landlordId, req.query);
    return res.status(200).json({ success: true, data: result.tickets, tickets: result.tickets, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function getTicketById(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
    const ticket = await ticketService.getTicketById(landlordId, req.params.id);
    return res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function createTicket(req, res) {
  try {
    const landlordId = req.user._id || req.user.id;
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
    const landlordId = req.user._id || req.user.id;
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
    const landlordId = req.user._id || req.user.id;
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
    const landlordId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await ticketService.deleteTicket(landlordId, req.params.id, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
