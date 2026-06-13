import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES = '7d';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password required' });
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    await user.save();

    // Generate JWTs for register too
    const cookieToken = jwt.sign(
      { userId: user._id, jti: uuidv4() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    const frontendToken = jwt.sign(
      { userId: user._id, jti: uuidv4() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Set httpOnly cookie
    res.cookie('token', cookieToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: frontendToken
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login  
router.post('/login', async (req, res) => {
  try {
    const { username_or_email, password } = req.body;

    if (!username_or_email || !password) {
      return res.status(400).json({ error: 'Username/email and password required' });
    }

    // Find user by username OR email
    const user = await User.findOne({ 
      $or: [{ username: username_or_email }, { email: username_or_email }] 
    }).select('+password');

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWTs - cookie + frontend storage
    const cookieToken = jwt.sign(
      { userId: user._id, jti: uuidv4() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    
    const frontendToken = jwt.sign(
      { userId: user._id, jti: uuidv4() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Set httpOnly cookie (backend default auth)
    res.cookie('token', cookieToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: frontendToken  // Frontend stores Bearer token in localStorage
    });

  } catch (error) {
    // ✅ BETTER ERROR HANDLING - Fix "Login failed" generic error
    console.error('🔍 LOGIN ERROR DETAILS:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\\n')[0]
    });

    if (error.name === 'MongoServerSelectionError' || error.message.includes('Mongo')) {
      return res.status(503).json({ error: 'Database unavailable. Please try again.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid user data. Please contact support.' });
    }
    if (error.code === 11000) { // Mongo duplicate key
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Generic server error (don't expose internals)
    res.status(500).json({ error: 'Login service temporarily unavailable' });
  }

});

// GET /api/auth/profile (protected) - FIXED with logging
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('✅ /api/auth/profile - SUCCESS for user:', req.user.username || req.user._id, '- Dashboard profile loaded!');
    
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profilePicture: req.user.profilePicture,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('❌ /api/auth/profile ERROR:', error.message, 'for user:', req.user?._id);
    res.status(500).json({ error: 'Profile fetch failed: ' + error.message });
  }
});


// 🔄 NEW: POST /api/auth/refresh - Extend session (same user, new 7d token)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Token refresh for:', req.user.username);
    
    // Generate NEW JWT (extends session)
    const newToken = jwt.sign(
      { userId: req.user._id, jti: uuidv4() },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Set new httpOnly cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      success: true, 
      message: 'Session refreshed',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Session refresh failed' });
  }
});

// 🔧 DEBUG ENDPOINT: Force seed test user (dev only)
router.post('/debug/seed', async (req, res) => {
  try {
    console.log('🧪 MANUAL SEED REQUEST');
    const { seedTestUser } = await import('../utils/seed.js');
    const result = await seedTestUser(true); // force=true
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Clear the token cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;

