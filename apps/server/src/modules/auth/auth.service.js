import jwt from 'jsonwebtoken';
import User from '../../shared/models/user.model.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_HAS_NUMBER = /\d/;

class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function validateSignup({ firstName, lastName, email, password }) {
  const errors = [];

  if (!firstName?.trim()) errors.push('firstName is required');
  if (!lastName?.trim()) errors.push('lastName is required');

  if (!email?.trim()) {
    errors.push('email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('email is invalid');
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
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function signupLandlord({ firstName, middleName, lastName, email, password }) {
  validateSignup({ firstName, lastName, email, password });

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
    password: password,
    role: 'landlord',
  });

  return sanitizeUser(user);
}

async function login({ email, password }) {
  if (!email?.trim() || !password) {
    throw new AuthError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user) {
    throw new AuthError('Invalid email or password', 401);
  }

  // Use model method
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthError('Invalid email or password', 401);
  }

  const token = signToken({ id: user._id.toString(), role: user.role });

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

export { signupLandlord, login, changePasswordService, AuthError };