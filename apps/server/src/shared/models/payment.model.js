import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      default: null,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'failed'],
      default: 'pending',
    },
    period: { type: String, default: null }, // e.g. "September 2026 Rent"
    paymentMethod: { type: String, default: null }, // e.g. "Visa •••• 4242", "Bank ACH"
    baseRent: { type: Number, default: 0 },
    parkingFee: { type: Number, default: 0 },
    utilityFee: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    mockTransactionId: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);