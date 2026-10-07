import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../../shared/models/user.model.js';
import { recordLoginSession } from '../../shared/services/sessionMonitor.service.js';
import { getMaintenanceState } from '../../shared/services/systemState.service.js';
import { sendPasswordResetEmail } from '../../shared/services/email.service.js';
import { uploadAvatarToCloudinary } from '../../shared/config/cloudinary.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_HAS_NUMBER = /\d/;

class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function validateSignup({ firstName, lastName, email, phone, password }) {
  const errors = [];

  if (!firstName?.trim()) errors.push('firstName is required');
  if (!lastName?.trim()) errors.push('lastName is required');

  if (!email?.trim()) {
    errors.push('email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('email is invalid');
  }

  if (phone && phone.trim().length > 30) {
    errors.push('phone must be under 30 characters');
  }

  if (!password) {
    errors.push('password is required');
  } else {
    if (password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }
    if (!PASSWORD_HAS_NUMBER.test(password)) {
      errors.push('password must contain at least one number');
    }
  }

  if (errors.length) throw new AuthError(errors.join(', '), 400);
}

function validatePasswordStrength(password) {
  const errors = [];
  if (!password) {
    errors.push('newPassword is required');
  } else {
    if (password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }
    if (!PASSWORD_HAS_NUMBER.test(password)) {
      errors.push('password must contain at least one number');
    }
  }
  if (errors.length) throw new AuthError(errors.join(', '), 400);
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    landlordId: user.role === 'staff' ? user.landlord : undefined,
    avatarUrl: user.avatarUrl || '',
    createdAt: user.createdAt,
  };
}

async function signupLandlord({ firstName, middleName, lastName, email, phone, password }) {
  const state = await getMaintenanceState();
  if (state.enabled) {
    throw new AuthError(state.message || 'Platform is currently undergoing scheduled maintenance. New registrations are temporarily paused.', 503);
  }

  validateSignup({ firstName, lastName, email, phone, password });

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AuthError('Email is already registered', 409);
  }

  // Pass raw password; userSchema.pre('save') handles hashing
  const user = await User.create({
    firstName: firstName.trim(),
    middleName: middleName?.trim() || '',
    lastName: lastName.trim(),
    email: normalizedEmail,
    phone: phone?.trim() || '',
    password: password,
    role: 'landlord',
  });

  return sanitizeUser(user);
}

async function login({ email, password, ip = '', userAgent = '' }) {
  if (!email?.trim() || !password) {
    throw new AuthError('Email and password are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Run User lookup and maintenance state check concurrently
  const [user, state] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select('+password'),
    getMaintenanceState(),
  ]);

  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  if (user.status !== 'active') {
    throw new AuthError('This account is suspended. Contact your landlord or administrator.', 403);
  }

  // Check maintenance mode: non-superadmin users are blocked when active
  if (state.enabled && user.role !== 'superadmin') {
    throw new AuthError(state.message || 'Platform is currently undergoing scheduled maintenance. Non-administrative logins are temporarily paused.', 503);
  }

  // Use model method
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthError('Invalid email or password', 401);
  }

  const token = signToken({ id: user._id.toString(), role: user.role, ...(user.role === 'staff' ? { landlord: user.landlord?.toString() } : {}) });

  // Record login session asynchronously (non-blocking for ultra-fast response)
  recordLoginSession({
    userId: user._id,
    email: user.email,
    role: user.role,
    ip,
    userAgent,
  }).catch((err) => console.error('Failed to log login session:', err));

  return { user: sanitizeUser(user), token };
}

async function loginSuperadmin({ email, password, ip = '', userAgent = '' }) {
  if (!email?.trim() || !password) {
    throw new AuthError('Email and password are required', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [user, isMatchPromise] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select('+password'),
    Promise.resolve(),
  ]);

  if (!user) {
    throw new AuthError('Invalid superadmin credentials', 401);
  }
  if (user.role !== 'superadmin') {
    throw new AuthError('Access denied: Superadmin role required', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthError('Invalid superadmin credentials', 401);
  }

  const token = signToken({ id: user._id.toString(), role: user.role });

  // Record login session asynchronously (non-blocking)
  recordLoginSession({
    userId: user._id,
    email: user.email,
    role: user.role,
    ip,
    userAgent,
  }).catch((err) => console.error('Failed to log superadmin session:', err));

  return { user: sanitizeUser(user), token };
}

async function changePasswordService(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new AuthError('Both currentPassword and newPassword are required', 400);
  }

  validatePasswordStrength(newPassword);

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AuthError('User not found', 404);
  }

  // 1. Verify current password using model instance method
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AuthError('Current password is incorrect', 401);
  }

  // 2. Prevent re-using the same password
  const isSame = await user.comparePassword(newPassword);
  if (isSame) {
    throw new AuthError('New password must be different from current password', 400);
  }

  // 3. Assign plain text; userSchema.pre('save') will hash it automatically on save()
  user.password = newPassword;
  await user.save();
  return { message: 'Password updated successfully' };
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) return null;
  return sanitizeUser(user);
}

/**
 * Forgot Password — generate a reset token and send email.
 * Always responds with a generic 200 to prevent email enumeration.
 */
async function forgotPassword({ email, origin }) {
  if (!email?.trim()) throw new AuthError('Email is required', 400);

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    '+passwordResetToken +passwordResetExpires'
  );

  // Silently succeed even if user not found (prevent enumeration)
  if (!user) return;

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${origin}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail({
    to: user.email,
    firstName: user.firstName,
    resetUrl,
  });
}

/**
 * Reset Password — consume the reset token and set a new password.
 */
async function resetPassword({ token, newPassword }) {
  if (!token) throw new AuthError('Reset token is required', 400);

  validatePasswordStrength(newPassword);

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AuthError('Reset token is invalid or has expired', 400);
  }

  // Prevent reusing the same password
  const isSame = await user.comparePassword(newPassword);
  if (isSame) throw new AuthError('New password must be different from current password', 400);

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: 'Password has been reset successfully. You may now sign in.' };
}

/**
 * Update Profile — updates basic profile info and optionally password
 */
async function updateProfileService(userId, { firstName, middleName, lastName, name, phone, currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AuthError('User not found', 404);
  }

  // Parse combined name if provided without explicit firstName/lastName
  if (name && (!firstName || !lastName)) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      user.firstName = parts[0];
    } else if (parts.length === 2) {
      user.firstName = parts[0];
      user.lastName = parts[1];
    } else if (parts.length >= 3) {
      user.firstName = parts[0];
      user.middleName = parts.slice(1, -1).join(' ');
      user.lastName = parts[parts.length - 1];
    }
  }

  if (firstName !== undefined && firstName.trim()) user.firstName = firstName.trim();
  if (middleName !== undefined) user.middleName = middleName.trim();
  if (lastName !== undefined && lastName.trim()) user.lastName = lastName.trim();
if (phone !== undefined && phone !== null) {
  user.phone = phone.trim();
}

  // If password update was included in profile patch
  if (newPassword) {
    if (!currentPassword) {
      throw new AuthError('Current password is required to set a new password', 400);
    }
    validatePasswordStrength(newPassword);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AuthError('Current password is incorrect', 401);
    }
    user.password = newPassword;
  }

  await user.save();
  return sanitizeUser(user);
}

/**
 * Upload and update user avatar photo via Cloudinary
 */
async function updateAvatarService(userId, fileBuffer, originalName) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError('User not found', 404);
  }

  const result = await uploadAvatarToCloudinary(fileBuffer, originalName, user._id.toString());
  user.avatarUrl = result.secure_url;
  await user.save();

  return {
    avatarUrl: user.avatarUrl,
    user: sanitizeUser(user),
  };
}

/**
 * Remove user avatar photo
 */
async function removeAvatarService(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError('User not found', 404);
  }

  user.avatarUrl = '';
  await user.save();

  return {
    avatarUrl: '',
    user: sanitizeUser(user),
  };
}

export { signupLandlord, login, loginSuperadmin, getUserById, changePasswordService, forgotPassword, resetPassword, updateProfileService, updateAvatarService, removeAvatarService, AuthError };
