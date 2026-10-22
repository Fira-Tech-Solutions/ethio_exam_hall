const jwt = require('jsonwebtoken');
const { query } = require('../db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'ethio_exam_hall_jwt_super_secret_dev_key_2026';

async function authenticate(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRes = await query('SELECT id, name, email, role, target_track, institution, candidate_id, is_verified FROM users WHERE id = $1', [decoded.id]);
    
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or session invalidated.' });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

async function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRes = await query('SELECT id, name, email, role, target_track, institution, candidate_id, is_verified FROM users WHERE id = $1', [decoded.id]);
    req.user = userRes.rows[0] || null;
  } catch {
    req.user = null;
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient administrative privileges.' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  JWT_SECRET,
};
