import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['submitted', 'acknowledged', 'in_progress', 'resolved', 'cancelled'],
      required: true,
    },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, enum: ['tenant', 'landlord', 'superadmin'], required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['HVAC', 'Plumbing', 'Electrical', 'Appliance', 'General'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['submitted', 'acknowledged', 'in_progress', 'resolved', 'cancelled'],
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
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', ticketSchema);