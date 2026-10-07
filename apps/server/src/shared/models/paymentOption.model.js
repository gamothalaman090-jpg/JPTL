import mongoose from 'mongoose';

const paymentOptionSchema = new mongoose.Schema({
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null, index: true },
  optionType: { type: String, enum: ['qr', 'bank_account', 'ewallet'], required: true },
  displayName: { type: String, required: true, trim: true, maxlength: 100 },
  providerName: { type: String, default: '', trim: true, maxlength: 100 },
  accountHolder: { type: String, default: '', trim: true, maxlength: 120 },
  accountNumber: { type: String, default: '', trim: true, maxlength: 80 },
  branch: { type: String, default: '', trim: true, maxlength: 100 },
  qrImageUrl: { type: String, default: '' },
  qrImagePublicId: { type: String, default: '' },
  instructions: { type: String, default: '', trim: true, maxlength: 1000 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

paymentOptionSchema.index({ landlord: 1, property: 1, isActive: 1 });

export default mongoose.model('PaymentOption', paymentOptionSchema);
