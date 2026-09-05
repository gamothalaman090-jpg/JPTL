import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "TICKET_STATUS_UPDATE"
    entityKind: {
      type: String,
      enum: ['Ticket', 'Payment', 'Document', 'Unit', 'Property', 'User', 'Announcement', 'Onboarding', 'Lease'],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);