import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected', 'closed', 'cancelled'],
      required: true,
    },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, enum: ['tenant', 'landlord', 'superadmin', 'system'], required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const technicianSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    eta: { type: String, default: '' },
    rating: { type: Number, default: 5 },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['HVAC', 'Plumbing', 'Electrical', 'Appliance', 'General', 'Structural', 'Pest', 'Other'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['submitted', 'acknowledged', 'in_progress', 'resolved', 'rejected', 'closed', 'cancelled'],
      default: 'submitted',
    },
    photoUrls: [{ type: String }],
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTechnician: {
      type: technicianSchema,
      default: null,
    },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', ticketSchema);