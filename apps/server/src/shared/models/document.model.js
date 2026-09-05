import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    buildingWide: {
      type: Boolean,
      default: false,
    },
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'Lease Agreement', 'Government ID', 'House Rules', 'Pool Policy'
    category: {
      type: String,
      enum: ['lease', 'upload', 'receipt', 'rules', 'policy'],
      required: true,
    },
    size: { type: String, default: '1.0 MB' },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending Review', 'Verified', 'Rejected', 'Active'],
      default: 'Pending Review',
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);