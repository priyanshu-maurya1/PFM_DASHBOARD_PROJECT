import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { blacklistToken } from '../middlewares/tokenBlacklist.js';
import dotenv from 'dotenv';

dotenv.config({ override: true, quiet: true });

const router = express.Router();

const generateToken = (userId) => {
  const jti = crypto.randomUUID();

  return jwt.sign(
    {
      userId,
      jti,
      iss: 'pfm-dashboard',
      aud: 'pfm-client',
    },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email has already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      maxAge: 10 * 60 * 1000,
    });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture },

    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { username_or_email, password } = req.body;

    if (!username_or_email || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    const isEmail = username_or_email.includes('@');
    const user = await User.findOne(
      isEmail ? { email: username_or_email } : { username: username_or_email }
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      maxAge: 10 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});


router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ message: 'Token not provided' });
    }

    const decoded = jwt.decode(token);
    if (decoded?.jti && decoded?.exp) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        await blacklistToken(decoded.jti, decoded.exp);
      } catch {
        console.warn('Token expired — still blacklisting');
        await blacklistToken(decoded.jti, decoded.exp);
      }
    }
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.json({ message: 'Logged out successfully' });
  }
});

export default router;
