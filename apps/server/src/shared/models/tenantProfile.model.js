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
    autoPayEnabled: { type: Boolean, default: true },
    securityDeposit: { type: Number, default: 0 },
    paymentMethods: [
      {
        id: { type: String },
        brand: { type: String },
        last4: { type: String },
        type: { type: String }, // 'card' or 'ach'
        isDefault: { type: Boolean, default: false },
        expiry: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('TenantProfile', tenantProfileSchema);