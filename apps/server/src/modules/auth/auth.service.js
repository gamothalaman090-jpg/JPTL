import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../shared/models/user.model.js';

const SALT_ROUNDS = 10;
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

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    firstName: firstName.trim(),
    middleName: middleName?.trim() || '',
    lastName: lastName.trim(),
    email: normalizedEmail,
    password: hashedPassword,
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

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthError('Invalid email or password', 401);
  }

  const token = signToken({ id: user._id.toString(), role: user.role });

  return { user: sanitizeUser(user), token };
}

export { signupLandlord, login, AuthError };