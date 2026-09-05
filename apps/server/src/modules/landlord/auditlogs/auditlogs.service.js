import AuditLog from '../../../shared/models/auditLog.model.js';

export async function getLandlordAuditLogs(landlordId, query = {}) {
  const filter = {
    $or: [
      { actor: landlordId },
      { actorRole: 'landlord' },
    ],
  };

  if (query.action && query.action !== 'all') {
    filter.action = query.action;
  }
  if (query.entityKind && query.entityKind !== 'all') {
    filter.entityKind = query.entityKind;
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 25, 100);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('actor', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  const formattedLogs = logs.map((log) => ({
    id: log._id,
    timestamp: log.createdAt,
    actorName: log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System',
    actorEmail: log.actor?.email || 'system@jptl.com',
    actorRole: log.actorRole,
    action: log.action,
    entityKind: log.entityKind,
    entityId: log.entityId,
    ipAddress: log.ipAddress || '127.0.0.1',
  }));

  return {
    logs: formattedLogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
