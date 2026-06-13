import express from 'express';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Get all notifications for current user (paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { type, isRead } = req.query;
    
    const query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query)
    ]);
    
    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (err) {
    console.error('Error getting unread count:', err);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get single notification by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ notification });
  } catch (err) {
    console.error('Error fetching notification:', err);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    await notification.markAsRead();
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete single notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await Notification.deleteOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Delete all notifications for current user
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user._id });
    
    res.json({ message: 'All notifications deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting all notifications:', err);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

// Create a new notification (internal use or admin use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, title, message, link, metadata, priority, recipientId } = req.body;
    
    if (!type || !title || !message) {
      return res.status(400).json({ error: 'type, title, and message are required' });
    }
    
    // Allow sending to self or to specified recipient
    const targetUserId = recipientId || req.user._id;
    
    const notification = await Notification.create({
      userId: targetUserId,
      type,
      title,
      message,
      link,
      metadata,
      priority: priority || 'medium'
    });
    
    res.status(201).json({ message: 'Notification created', notification });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router;

