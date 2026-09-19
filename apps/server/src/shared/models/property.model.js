import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    image: { type: String, default: '/images/default-property.jpg' },
    unitsCount: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['Luxury', 'Studio', 'Penthouse', 'Residential', 'Commercial'],
      default: 'Residential',
    },
    featured: { type: Boolean, default: false },
    accessCodes: {
      gateCode:     { type: String, default: '' },
      wifiSsid:     { type: String, default: '' },
      wifiPassword: { type: String, default: '' },
    },
    buildingRules: [{ type: String }],
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

propertySchema.index({ landlord: 1 });

export default mongoose.model('Property', propertySchema);