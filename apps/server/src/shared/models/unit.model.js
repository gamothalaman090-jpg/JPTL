import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, // e.g. "Unit 14B"
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    monthlyRent: { type: Number, required: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 1 },
    sqft: { type: Number, required: true },
    status: {
      type: String,
      enum: ['occupied', 'vacant', 'maintenance'],
      default: 'vacant',
    },
    leaseStart: { type: Date, default: null },
    leaseEnd: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Unit', unitSchema);