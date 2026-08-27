import * as authService from './auth.service.js';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day, match JWT_EXPIRES_IN

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  };
}

async function signupLandlord(req, res) {
  try {
    const user = await authService.signupLandlord(req.body);
    return res.status(201).json({ success: true, user });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

async function login(req, res) {
  try {
    const { user, token } = await authService.login(req.body);
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return res.status(200).json({ success: true, role: user.role, token });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

async function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  return res.status(200).json({ success: true, message: 'Logged out' });
}

export { signupLandlord, login, logout };