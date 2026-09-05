import Ticket from '../../../shared/models/ticket.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';

export class TenantTicketError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function logAction({ actorId, action, entityKind = 'Ticket', entityId, beforeState = null, afterState = null, ipAddress = '' }) {
  try {
    await AuditLog.create({
      actor: actorId,
      actorRole: 'tenant',
      action,
      entityKind,
      entityId,
      beforeState,
      afterState,
      ipAddress,
    });
  } catch (err) {
    console.error('Tenant Ticket AuditLog error:', err.message);
  }
}

/**
 * GET all tickets for authenticated tenant
 */
export async function getTenantTickets(tenantId, query = {}) {
  const { status } = query;

  const matchFilter = { tenant: tenantId };
  if (status && status !== 'all') {
    matchFilter.status = status;
  }

  const rawTickets = await Ticket.find(matchFilter)
    .populate('unit')
    .sort({ createdAt: -1 })
    .lean();

  const propertyIds = rawTickets.map((t) => t.unit?.property).filter(Boolean);
  const properties = await Property.find({ _id: { $in: propertyIds } }).lean();
  const propertyMap = new Map(properties.map((p) => [p._id.toString(), p]));

  const formattedTickets = rawTickets.map((t) => {
    const propertyDoc = t.unit?.property ? propertyMap.get(t.unit.property.toString()) : null;

    return {
      ...t,
      id: t._id,
      unitId: t.unit?._id || null,
      unitLabel: t.unit?.label || 'Unit N/A',
      propertyId: propertyDoc?._id || null,
      propertyName: propertyDoc?.name || 'Property N/A',
      propertyAddress: propertyDoc?.address || '',
    };
  });

  const totalOpen = formattedTickets.filter((t) => !['resolved', 'closed', 'cancelled'].includes(t.status)).length;
  const totalResolved = formattedTickets.filter((t) => t.status === 'resolved').length;

  return {
    tickets: formattedTickets,
    metrics: {
      total: formattedTickets.length,
      open: totalOpen,
      resolved: totalResolved,
    },
  };
}

/**
 * GET single ticket by ID for tenant
 */
export async function getTenantTicketById(tenantId, ticketId) {
  const ticket = await Ticket.findOne({ _id: ticketId, tenant: tenantId })
    .populate('unit')
    .lean();

  if (!ticket) throw new TenantTicketError('Ticket not found or access denied', 404);

  const property = ticket.unit?.property
    ? await Property.findById(ticket.unit.property).lean()
    : null;

  return {
    ...ticket,
    id: ticket._id,
    unitLabel: ticket.unit?.label || 'Unit N/A',
    propertyName: property?.name || 'Property N/A',
    propertyAddress: property?.address || '',
  };
}

/**
 * SUBMIT a new maintenance ticket (Tenant)
 */
export async function submitTenantTicket(tenantId, payload, ipAddress = '') {
  const { title, description, category, priority = 'medium', photoUrls = [], unitId } = payload;

  if (!title?.trim()) throw new TenantTicketError('Ticket title is required', 400);
  if (!description?.trim()) throw new TenantTicketError('Issue description is required', 400);

  // 1. Resolve unit for this tenant
  let targetUnit;
  if (unitId) {
    targetUnit = await Unit.findOne({ _id: unitId, tenant: tenantId }).lean();
  }
  if (!targetUnit) {
    targetUnit = await Unit.findOne({ tenant: tenantId }).lean();
  }
  if (!targetUnit) {
    // If tenant not yet bound in DB, find any active unit or throw
    targetUnit = await Unit.findOne({ status: 'occupied' }).lean();
  }
  if (!targetUnit) {
    throw new TenantTicketError('No unit found assigned to your tenant account', 400);
  }

  const property = await Property.findById(targetUnit.property).lean();

  const initialHistory = [
    {
      status: 'submitted',
      changedBy: tenantId,
      userRole: 'tenant',
      note: 'Maintenance ticket submitted by tenant',
      timestamp: new Date(),
    },
  ];

  const ticket = await Ticket.create({
    title: title.trim(),
    description: description.trim(),
    category: category || 'General',
    priority: priority || 'medium',
    status: 'submitted',
    unit: targetUnit._id,
    tenant: tenantId,
    photoUrls,
    assignedTechnician: null,
    statusHistory: initialHistory,
  });

  await logAction({
    actorId: tenantId,
    action: 'TICKET_SUBMITTED',
    entityId: ticket._id,
    afterState: ticket.toObject(),
    ipAddress,
  });

  return {
    ...ticket.toObject(),
    id: ticket._id,
    unitLabel: targetUnit.label,
    propertyName: property?.name || 'Property N/A',
  };
}

/**
 * CANCEL ticket (Tenant)
 */
export async function cancelTenantTicket(tenantId, ticketId, reason = '', ipAddress = '') {
  const ticket = await Ticket.findOne({ _id: ticketId, tenant: tenantId });
  if (!ticket) throw new TenantTicketError('Ticket not found or access denied', 404);

  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    throw new TenantTicketError('Cannot cancel an already resolved or closed ticket', 400);
  }

  const beforeState = ticket.toObject();

  ticket.status = 'cancelled';
  ticket.statusHistory.push({
    status: 'cancelled',
    changedBy: tenantId,
    userRole: 'tenant',
    note: reason ? `Cancelled by tenant: ${reason}` : 'Cancelled by tenant',
    timestamp: new Date(),
  });

  await ticket.save();

  await logAction({
    actorId: tenantId,
    action: 'TICKET_CANCELLED',
    entityId: ticket._id,
    beforeState,
    afterState: ticket.toObject(),
    ipAddress,
  });

  return {
    success: true,
    message: 'Ticket cancelled successfully',
    ticket: { ...ticket.toObject(), id: ticket._id },
  };
}

/**
 * ADD comment / note to ticket (Tenant)
 */
export async function addTenantComment(tenantId, ticketId, note, ipAddress = '') {
  if (!note?.trim()) throw new TenantTicketError('Note content cannot be empty', 400);

  const ticket = await Ticket.findOne({ _id: ticketId, tenant: tenantId });
  if (!ticket) throw new TenantTicketError('Ticket not found or access denied', 404);

  ticket.statusHistory.push({
    status: ticket.status,
    changedBy: tenantId,
    userRole: 'tenant',
    note: note.trim(),
    timestamp: new Date(),
  });

  await ticket.save();

  await logAction({
    actorId: tenantId,
    action: 'TICKET_COMMENT_ADDED',
    entityId: ticket._id,
    ipAddress,
  });

  return {
    success: true,
    message: 'Comment added',
    ticket: { ...ticket.toObject(), id: ticket._id },
  };
}
