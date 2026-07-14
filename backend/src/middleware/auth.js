// src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      console.error('SUPABASE_JWT_SECRET is not set in environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.error('Invalid JWT token:', err.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Supabase stores user id in `sub` claim
    const userId = decoded?.sub || decoded?.user_id || decoded?.id;
    if (!userId) {
      console.error('JWT does not contain user id (sub)');
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    // Attach studentId for downstream handlers
    req.studentId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};