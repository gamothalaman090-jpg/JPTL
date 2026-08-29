import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'Lease Agreement', 'Government ID'
    category: {
      type: String,
      enum: ['lease', 'upload', 'receipt'],
      required: true,
    },
    size: { type: String, required: true },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending Review', 'Verified', 'Rejected'],
      default: 'Pending Review',
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);