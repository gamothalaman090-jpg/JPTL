import mongoose from 'mongoose';

const extensionRequestSchema = new mongoose.Schema(
  {
    termMonths: { type: Number, required: true }, // e.g. 6, 12, 24
    proposedStartDate: { type: Date, required: true },
    proposedEndDate: { type: Date, required: true },
    monthlyRent: { type: Number, required: true },
    tenantNotes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    landlordNotes: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: true }
);

const terminationRequestSchema = new mongoose.Schema({
  requestedMoveOutDate: { type: Date, required: true },
  reason: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  landlordNotes: { type: String, default: '', maxlength: 1000 },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const leaseSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    leaseStart: { type: Date, required: true },
    leaseType: { type: String, enum: ['fixed_term', 'indefinite'], default: 'fixed_term' },
    leaseEnd: { type: Date, default: null },
    monthlyRent: { type: Number, required: true },
    hasParking: { type: Boolean, default: false },
    parkingSpot: { type: String, default: null },
    parkingFee: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'renewal_pending', 'renewal_approved', 'renewal_rejected', 'ended'],
      default: 'active',
    },
    contractPdfUrl: { type: String, default: '/docs/sample-lease-agreement.pdf' },
    covenants: {
      type: [String],
      default: [
        'Quiet hours: 10:00 PM – 7:00 AM daily',
        'Trash disposal via floor chutes (7:00 AM – 10:00 PM)',
        'Guest registration required for stays exceeding 48 hours',
        'No unauthorized structural alterations or lock changes',
      ],
    },
    extensionRequests: [extensionRequestSchema],
    terminationRequests: [terminationRequestSchema],
  },
  { timestamps: true }
);

leaseSchema.index({ tenant: 1, status: 1 });
leaseSchema.index({ landlord: 1 });
leaseSchema.index({ unit: 1 });

export default mongoose.model('Lease', leaseSchema);
