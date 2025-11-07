import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import PlaidItem from '../models/PlaidItem.js';
import Message from '../models/Message.js';
import Account from '../models/Account.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const __dirname = import.meta.dirname;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user._id;

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Upload profile picture
router.post('/profile/upload', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    
    // Delete old profile picture if it exists
    if (user.profilePicture) {
      const oldFilePath = path.join(uploadsDir, path.basename(user.profilePicture));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user with new profile picture URL
    const profilePictureUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePictureUrl },
      { new: true }
    ).select('-password');

    res.json({ 
      message: 'Profile picture uploaded successfully', 
      user: updatedUser,
      profilePicture: profilePictureUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users (by username or email) - used by chat/user search
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q, 'i');
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [ { username: regex }, { email: regex } ]
    })
      .select('_id username email profilePicture')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Server error searching users' });
  }
});

export default router;

// ----- Privacy / account management routes -----

// Get privacy/preferences
router.get('/privacy', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences twoFactorEnabled');
    res.json({ preferences: user.preferences || {}, twoFactorEnabled: user.twoFactorEnabled || false });
  } catch (err) {
    console.error('Error fetching privacy settings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update privacy/preferences
router.put('/privacy', authenticateToken, async (req, res) => {
  try {
    const updates = {};
    if (req.body.preferences) updates.preferences = req.body.preferences;
    if (typeof req.body.twoFactorEnabled === 'boolean') updates.twoFactorEnabled = req.body.twoFactorEnabled;

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ message: 'Privacy settings updated', user: updated });
  } catch (err) {
    console.error('Error updating privacy settings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export user data (JSON) - limited to avoid huge payloads
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const [transactions, budgets, messages, plaidItems, accounts] = await Promise.all([
      Transaction.find({ userId }).limit(2000).lean(),
      Budget.find({ userId }).limit(2000).lean(),
      Message.find({ $or: [{ senderId: userId }, { receiverId: userId }] }).limit(2000).lean(),
      PlaidItem.find({ userId }).lean(),
      Account.find({ userId }).lean()
    ]);

    const exportPayload = { user: { id: req.user._id, username: req.user.username, email: req.user.email }, transactions, budgets, messages, plaidItems, accounts };
    res.json(exportPayload);
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account (and related data)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Remove related documents
    await Promise.all([
      Transaction.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
      PlaidItem.deleteMany({ userId }),
      Account.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    // Clear auth cookie
    res.clearCookie('token', { httpOnly: true });
    res.json({ message: 'Account and associated data deleted' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
