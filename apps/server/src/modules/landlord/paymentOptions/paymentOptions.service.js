import mongoose from 'mongoose';
import PaymentOption from '../../../shared/models/paymentOption.model.js';
import AuditLog from '../../../shared/models/auditLog.model.js';
import { uploadPaymentAssetToCloudinary } from '../../../shared/config/cloudinary.js';

export class PaymentOptionError extends Error {
  constructor(message, statusCode = 400) { super(message); this.statusCode = statusCode; }
}

function requireText(value, field, max = 120) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw new PaymentOptionError(`${field} is required`, 400);
  if (text.length > max) throw new PaymentOptionError(`${field} must be ${max} characters or fewer`, 400);
  return text;
}

function validateEwalletProvider(value) {
  const provider = String(value || '').trim();
  if (!['Maya', 'GCash'].includes(provider)) throw new PaymentOptionError('E-wallet provider must be Maya or GCash', 400);
  return provider;
}

function validateImage(file) {
  if (!file?.buffer) throw new PaymentOptionError('A QR image file is required', 400);
  const b = file.buffer;
  const png = b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const webp = b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
  if (!png && !jpeg && !webp) throw new PaymentOptionError('QR image must be a valid PNG, JPG, or WebP file', 400);
}

export async function listPaymentOptions(landlordId) {
  return PaymentOption.find({ landlord: landlordId }).populate('property', 'name').sort({ createdAt: -1 }).lean();
}

export async function createPaymentOption(landlordId, data, file, ipAddress = '') {
  const optionType = data.optionType;
  if (!['qr', 'bank_account', 'ewallet'].includes(optionType)) throw new PaymentOptionError('optionType must be qr, bank_account, or ewallet', 400);
  const option = {
    landlord: landlordId,
    property: null,
    optionType,
    displayName: requireText(data.displayName, 'Display name'),
    providerName: optionType === 'ewallet' ? validateEwalletProvider(data.providerName) : String(data.providerName || '').trim().slice(0, 100),
    instructions: String(data.instructions || '').trim().slice(0, 1000),
    isActive: data.isActive !== 'false',
  };
  if (optionType === 'qr') {
    validateImage(file);
    const uploaded = await uploadPaymentAssetToCloudinary(file.buffer, file.originalname, { folder: 'jptl_payment_qr' });
    option.qrImageUrl = uploaded.secure_url;
    option.qrImagePublicId = uploaded.public_id;
  } else {
    option.accountHolder = requireText(data.accountHolder, 'Account holder');
    option.accountNumber = requireText(data.accountNumber, 'Account number', 80);
    option.branch = String(data.branch || '').trim().slice(0, 100);
    if (optionType === 'ewallet' && file) {
      validateImage(file);
      const uploaded = await uploadPaymentAssetToCloudinary(file.buffer, file.originalname, { folder: 'jptl_payment_qr' });
      option.qrImageUrl = uploaded.secure_url;
      option.qrImagePublicId = uploaded.public_id;
    }
  }
  const created = await PaymentOption.create(option);
  await AuditLog.create({ actor: landlordId, actorRole: 'landlord', action: 'PAYMENT_OPTION_CREATED', entityKind: 'PaymentOption', entityId: created._id, ipAddress });
  return created.toObject();
}

export async function updatePaymentOption(landlordId, optionId, data, file, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(optionId)) throw new PaymentOptionError('Invalid payment option ID', 400);
  const option = await PaymentOption.findOne({ _id: optionId, landlord: landlordId });
  if (!option) throw new PaymentOptionError('Payment option not found or access denied', 404);
  if (data.displayName !== undefined) option.displayName = requireText(data.displayName, 'Display name');
  if (data.providerName !== undefined) option.providerName = option.optionType === 'ewallet' ? validateEwalletProvider(data.providerName) : String(data.providerName).trim().slice(0, 100);
  if (data.instructions !== undefined) option.instructions = String(data.instructions).trim().slice(0, 1000);
  option.property = null;
  if (data.accountHolder !== undefined) option.accountHolder = String(data.accountHolder).trim().slice(0, 120);
  if (data.accountNumber !== undefined) option.accountNumber = String(data.accountNumber).trim().slice(0, 80);
  if (data.branch !== undefined) option.branch = String(data.branch).trim().slice(0, 100);
  if (file) {
    if (!['qr', 'ewallet'].includes(option.optionType)) throw new PaymentOptionError('Only QR and e-wallet options can have a QR image', 400);
    validateImage(file);
    const uploaded = await uploadPaymentAssetToCloudinary(file.buffer, file.originalname, { folder: 'jptl_payment_qr' });
    option.qrImageUrl = uploaded.secure_url;
    option.qrImagePublicId = uploaded.public_id;
  }
  await option.save();
  await AuditLog.create({ actor: landlordId, actorRole: 'landlord', action: 'PAYMENT_OPTION_UPDATED', entityKind: 'PaymentOption', entityId: option._id, ipAddress });
  return option.toObject();
}

export async function setPaymentOptionActive(landlordId, optionId, isActive, ipAddress = '') {
  if (!mongoose.Types.ObjectId.isValid(optionId)) throw new PaymentOptionError('Invalid payment option ID', 400);
  const option = await PaymentOption.findOne({ _id: optionId, landlord: landlordId });
  if (!option) throw new PaymentOptionError('Payment option not found or access denied', 404);
  option.isActive = Boolean(isActive);
  await option.save();
  await AuditLog.create({ actor: landlordId, actorRole: 'landlord', action: option.isActive ? 'PAYMENT_OPTION_ACTIVATED' : 'PAYMENT_OPTION_DEACTIVATED', entityKind: 'PaymentOption', entityId: option._id, ipAddress });
  return option.toObject();
}
