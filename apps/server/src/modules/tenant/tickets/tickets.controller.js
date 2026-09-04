import * as tenantTicketService from './tickets.service.js';

export async function getTickets(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const result = await tenantTicketService.getTenantTickets(tenantId, req.query);
    return res.status(200).json({ success: true, data: result.tickets, tickets: result.tickets, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function getTicketById(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const ticket = await tenantTicketService.getTenantTicketById(tenantId, req.params.id);
    return res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function submitTicket(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const ticket = await tenantTicketService.submitTenantTicket(tenantId, req.body, ipAddress);
    return res.status(201).json({ success: true, message: 'Ticket submitted successfully', data: ticket });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function cancelTicket(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await tenantTicketService.cancelTenantTicket(tenantId, req.params.id, req.body.reason, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

export async function addComment(req, res) {
  try {
    const tenantId = req.user._id || req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const result = await tenantTicketService.addTenantComment(tenantId, req.params.id, req.body.note, ipAddress);
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}
