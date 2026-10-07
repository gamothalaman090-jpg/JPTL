import mongoose from 'mongoose';

const evictionNoticeSchema = new mongoose.Schema({
  lease: { type: mongoose.Schema.Types.ObjectId, ref: 'Lease', required: true, index: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  reason: { type: String, required: true, trim: true, maxlength: 2000 },
  issuedAt: { type: Date, required: true, default: Date.now },
  moveOutDate: { type: Date, required: true },
  noticePeriodDays: { type: Number, required: true, default: 40 },
  documentUrl: { type: String, default: '' },
  status: { type: String, enum: ['active', 'canceled', 'overridden', 'completed'], default: 'active' },
  overriddenAt: { type: Date, default: null },
  overrideReason: { type: String, default: '' },
  canceledAt: { type: Date, default: null },
  cancellationReason: { type: String, default: '' },
  canceledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

evictionNoticeSchema.index({ lease: 1, createdAt: -1 });

export default mongoose.model('EvictionNotice', evictionNoticeSchema);
