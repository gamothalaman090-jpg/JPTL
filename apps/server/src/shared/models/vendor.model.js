import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Plumbing', 'Electrical', 'HVAC', 'General', 'Appliance', 'Structural', 'Pest', 'Other'],
      required: true,
    },
    contactPhone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    contactPerson: { type: String, trim: true, default: '' },
    autoAssign: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
