import jwt from 'jsonwebtoken';

export function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';
  const id = payload.id || payload._id;
  return jwt.sign(
    {
      _id: id,
      id,
      role: payload.role,
      email: payload.email,
      ...payload,
    },
    secret,
    { expiresIn: '1d', ...options }
  );
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';
  return jwt.verify(token, secret);
}
