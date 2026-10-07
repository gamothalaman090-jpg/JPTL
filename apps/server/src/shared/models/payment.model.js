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
      enum: ['draft', 'pending', 'paid', 'overdue', 'failed'],
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
    receiptNumber: { type: String, default: null },
    paidAt: { type: Date, default: null },
    reviewStatus: { type: String, enum: [null, 'pending_review', 'rejected', 'approved'], default: null },
    paymentChannel: { type: String, enum: [null, 'qr_transfer', 'bank_transfer', 'ewallet_transfer', 'onsite'], default: null },
    paymentOption: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentOption', default: null },
    paymentOptionSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    receiptPublicId: { type: String, default: null },
    receiptFormat: { type: String, default: null },
    receiptOriginalName: { type: String, default: null },
    receiptBytes: { type: Number, default: 0 },
    transferReference: { type: String, default: '' },
    tenantPaymentNote: { type: String, default: '' },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' },
    isAdvancePayment: { type: Boolean, default: false },
    advanceMonthsAhead: { type: Number, default: 0 }, // 1, 2, 3... months paid ahead of current due
  },
  { timestamps: true }
);

paymentSchema.index({ tenant: 1, dueDate: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ property: 1 });
paymentSchema.index({ unit: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
