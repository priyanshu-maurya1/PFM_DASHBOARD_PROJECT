import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Create a message
router.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: 'senderId, receiverId and text are required' });
    }

    const msg = await Message.create({ senderId, receiverId, text });
    res.json({ message: msg });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Get messages between two users (userId and receiverId)
router.get('/api/messages/:userId/:receiverId', authenticateToken, async (req, res) => {
  try {
    const { userId, receiverId } = req.params;
    // Validate users exist (optional)
    // Fetch messages where (sender=userId and receiver=receiverId) OR (sender=receiverId and receiver=userId)
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
