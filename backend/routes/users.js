import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import PlaidItem from '../models/PlaidItem.js';
import Message from '../models/Message.js';
import Account from '../models/Account.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory
const baseUploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(baseUploadsDir)) {
  fs.mkdirSync(baseUploadsDir, { recursive: true });
}

// Helper function to get user-specific profile pictures directory
const getUserProfileDir = (userId) => {
  const userDir = path.join(baseUploadsDir, 'profiles', userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
};

// Configure multer for profile picture uploads - stores in user-specific directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get userId from authenticated user
    const userId = req.user?._id || req.user?.id || 'default';
    const userDir = getUserProfileDir(userId);
    cb(null, userDir);
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
    res.json({ 
      success: true, 
      user 
    });
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
      // The old profile picture could be in different locations:
      // 1. /uploads/profile-xxx.jpeg (old format)
      // 2. /uploads/profiles/{userId}/profile-xxx.jpeg (new format)
      
      let oldFilePath = '';
      
      if (user.profilePicture.startsWith('/uploads/profiles/')) {
        // New format - file is in user-specific directory
        oldFilePath = path.join(__dirname, '..', user.profilePicture);
      } else if (user.profilePicture.startsWith('/uploads/')) {
        // Old format - file is in root uploads directory
        oldFilePath = path.join(__dirname, '..', user.profilePicture);
      }
      
      if (oldFilePath && fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          console.log('Deleted old profile picture:', oldFilePath);
        } catch (deleteErr) {
          console.warn('Could not delete old profile picture:', deleteErr.message);
        }
      }
    }

    // Update user with new profile picture URL (user-specific path)
    const profilePictureUrl = `/uploads/profiles/${userId}/${req.file.filename}`;
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
    console.error('Profile upload error:', error);
    res.status(500).json({ error: 'Server error uploading profile picture' });
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

// GET /api/users/profiles - List all user profiles (authenticated users only)
router.get('/profiles', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('_id username email profilePicture role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      profiles: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Profiles list error:', error);
    res.status(500).json({ error: 'Server error fetching profiles' });
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
