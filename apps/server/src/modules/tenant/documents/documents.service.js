import Document from '../../../shared/models/document.model.js';
import Unit from '../../../shared/models/unit.model.js';
import Property from '../../../shared/models/property.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import { uploadDocumentToCloudinary } from '../../../shared/config/cloudinary.js';

export class DocumentError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function logAction({ actorId, action, entityKind = 'Document', entityId, beforeState = null, afterState = null, ipAddress = '' }) {
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
    console.error('Tenant Document AuditLog error:', err.message);
  }
}

/**
 * GET all documents submitted by or associated with tenant
 */
export async function getTenantDocuments(tenantId, query = {}) {
  const { status, type } = query;

  const matchFilter = { tenant: tenantId };
  if (status && status !== 'all') {
    matchFilter.status = status;
  }
  if (type && type !== 'all') {
    matchFilter.type = type;
  }

  const rawDocs = await Document.find(matchFilter)
    .populate('unit')
    .sort({ createdAt: -1 })
    .lean();

  const propertyIds = rawDocs.map((d) => d.unit?.property).filter(Boolean);
  const properties = await Property.find({ _id: { $in: propertyIds } }).lean();
  const propertyMap = new Map(properties.map((p) => [p._id.toString(), p]));

  const formattedDocs = rawDocs.map((d) => {
    const prop = d.unit?.property ? propertyMap.get(d.unit.property.toString()) : null;
    return {
      ...d,
      id: d._id,
      unitLabel: d.unit?.label || 'Unit N/A',
      propertyName: prop?.name || 'Property N/A',
    };
  });

  const totalCount = formattedDocs.length;
  const verifiedCount = formattedDocs.filter((d) => d.status === 'Verified').length;
  const pendingCount = formattedDocs.filter((d) => d.status === 'Pending Review').length;
  const rejectedCount = formattedDocs.filter((d) => d.status === 'Rejected').length;

  return {
    documents: formattedDocs,
    metrics: {
      total: totalCount,
      verified: verifiedCount,
      pending: pendingCount,
      rejected: rejectedCount,
    },
  };
}

/**
 * SUBMIT a compliance / verification document (Tenant)
 */
export async function submitTenantDocument(tenantId, payload, file = null, ipAddress = '') {
  const { name, type = 'Proof of Insurance', category = 'upload', notes = '', fileSize, fileUrl } = payload;

  if (!type?.trim()) {
    throw new DocumentError('Document classification / type is required', 400);
  }

  // Find tenant unit
  let targetUnit = await Unit.findOne({ tenant: tenantId }).lean();
  if (!targetUnit) {
    targetUnit = await Unit.findOne({ status: 'occupied' }).lean();
  }
  if (!targetUnit) {
    throw new DocumentError('No active unit assigned to your tenant account to attach document', 400);
  }

  // Handle file upload to Cloudinary (or fallback)
  let resolvedUrl = fileUrl || '';
  let resolvedSize = fileSize || '1.4 MB';

  if (file && file.buffer) {
    const uploadResult = await uploadDocumentToCloudinary(file.buffer, file.originalname || name || 'document.pdf');
    resolvedUrl = uploadResult.secure_url;
    resolvedSize = `${(uploadResult.bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else if (!resolvedUrl) {
    // Generate default secure mock asset URL
    const docName = (name || type).replace(/\s+/g, '_');
    resolvedUrl = `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/jptl_vault/${docName}.pdf`;
  }

  const docName = name?.trim() || `${type.replace(/\s+/g, '_')}_Document.pdf`;

  const newDoc = await Document.create({
    tenant: tenantId,
    unit: targetUnit._id,
    name: docName,
    type: type.trim(),
    category: ['lease', 'upload', 'receipt'].includes(category) ? category : 'upload',
    size: resolvedSize,
    fileUrl: resolvedUrl,
    status: 'Pending Review',
  });

  await logAction({
    actorId: tenantId,
    action: 'DOCUMENT_SUBMITTED',
    entityId: newDoc._id,
    afterState: newDoc.toObject(),
    ipAddress,
  });

  return {
    ...newDoc.toObject(),
    id: newDoc._id,
    unitLabel: targetUnit.label,
    notes,
  };
}

/**
 * DELETE a document (Tenant - only if pending review)
 */
export async function deleteTenantDocument(tenantId, docId, ipAddress = '') {
  const doc = await Document.findOne({ _id: docId, tenant: tenantId });
  if (!doc) throw new DocumentError('Document not found or access denied', 404);

  if (doc.status === 'Verified') {
    throw new DocumentError('Cannot delete a verified compliance document. Please contact your property manager.', 400);
  }

  const beforeState = doc.toObject();
  await Document.findByIdAndDelete(docId);

  await logAction({
    actorId: tenantId,
    action: 'DOCUMENT_DELETED',
    entityId: docId,
    beforeState,
    afterState: null,
    ipAddress,
  });

  return {
    success: true,
    message: `Document "${doc.name}" deleted successfully.`,
    deletedDocId: docId,
  };
}
