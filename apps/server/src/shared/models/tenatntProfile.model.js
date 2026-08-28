import mongoose from 'mongoose';

const tenantProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null,
    },
    monthlyRent: { type: Number, default: 0 },
    leaseStart: { type: Date, default: null },
    leaseEnd: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'pre_added', 'evicted', 'past'],
      default: 'pre_added',
    },
  },
  { timestamps: true }
);

export default mongoose.model('TenantProfile', tenantProfileSchema);