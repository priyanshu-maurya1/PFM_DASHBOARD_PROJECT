import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isTokenBlacklisted } from './tokenBlacklist.js';

export const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is blacklisted
    try {
      if (decoded.jti && await isTokenBlacklisted(decoded.jti)) {
        return res.status(401).json({ error: 'Token revoked' });
      }
    } catch (err) {
      console.error('Redis unavailable, skipping blacklist check');
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    req.tokenJti = decoded.jti;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};