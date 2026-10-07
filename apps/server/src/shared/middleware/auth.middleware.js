import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

async function requireAuth(req, res, next) {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  // Prioritize per-tab Bearer token from header over global browser cookie or URL query token
  const token = bearerToken || req.cookies?.token || req.query?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  if (decoded.role === 'staff') {
    try {
      const staff = await User.findOne({ _id: decoded.id, role: 'staff', status: 'active' }).select('landlord').lean();
      if (!staff?.landlord) return res.status(401).json({ success: false, message: 'Staff account is suspended or no longer active.' });
      decoded.landlord = staff.landlord.toString();
    } catch (error) {
      return next(error);
    }
  }
  req.user = decoded;
  return next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  };
}

export { requireAuth, requireRole };
