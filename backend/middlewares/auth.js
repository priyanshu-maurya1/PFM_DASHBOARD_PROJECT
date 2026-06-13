import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { isTokenBlacklisted } from './tokenBlacklist.js';

export const authenticateToken = async (req, res, next) => {
// Check for token in cookies first, then fall back to Authorization header
  let token = req.cookies.token;
// ✅ ENHANCED DEBUGGING - Profile/Dashboard auth failures
console.log('🔍 Auth Debug:', {
  hasCookie: !!req.cookies.token,
  cookieLen: req.cookies.token?.length || 0,
  origin: req.headers.origin,
  userAgent: req.headers['user-agent']?.substring(0, 50),
  path: req.path
});
  
  // If no cookie token, check Authorization header (Bearer token)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    console.log('❌ Auth Debug - NO TOKEN - 401');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const decoded = jwt.verify(token, secret);
    
    // Check if token is blacklisted
    try {
      if (decoded.jti && await isTokenBlacklisted(decoded.jti)) {
        return res.status(401).json({ error: 'Token revoked' });
      }
    } catch (err) {
      console.error('Redis unavailable, skipping blacklist check');
    }

    console.log('🔍 Auth Debug - Looking up user:', decoded.userId);
    // ✅ FIXED: Use imported User model directly (ES modules)
    const user = await User.findById(decoded.userId).select('-password').lean();
    
    if (user) {
      console.log(`✅ Auth SUCCESS - ${user.username} (${user.email}) from ${req.headers.origin}`);
    } else {
      console.error(`❌ Auth FAIL - User not found: ${decoded.userId}`);
    }
    
    if (!user) {
      console.log('❌ Auth Debug - USER NOT FOUND - 401');
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    req.tokenJti = decoded.jti;
    next();
  } catch (error) {
    console.log('❌ Auth Debug - JWT ERROR:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
