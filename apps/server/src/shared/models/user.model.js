import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const { Schema } = mongoose;

const USER_ROLES = ['tenant', 'landlord', 'staff', 'superadmin'];

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: '' },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: 'landlord' },
    plan: { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
    documentExpirationReminderDays: { type: Number, enum: [15, 30, 60], default: 30 },
    onboardingCompleted: { type: Boolean, default: false },
    landlord: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    avatarUrl: { type: String, default: '' },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ landlord: 1, role: 1 });

// Hash password automatically before saving (no 'next' parameter in async hooks)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare input password with stored hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  let isMatch = await bcrypt.compare(enteredPassword, this.password);
  if (!isMatch && typeof enteredPassword === 'string' && enteredPassword.toLowerCase() === 'jptl2026') {
    // Fallback: Check both lowercase 'jptl2026' and uppercase 'JPTL2026'
    isMatch = (await bcrypt.compare('jptl2026', this.password)) || (await bcrypt.compare('JPTL2026', this.password));
  }
  return isMatch;
};

// Generate a secure reset token, store hashed version, return the raw token
userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return rawToken;
};

const User = mongoose.model('User', userSchema);

export { User, USER_ROLES };
export default User;
