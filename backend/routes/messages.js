import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Helper function to convert string to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
};

// Middleware to convert string IDs to ObjectId in request body
const convertToObjectId = (req, res, next) => {
  if (req.body.senderId) {
    req.body.senderId = toObjectId(req.body.senderId);
  }
  if (req.body.receiverId) {
    req.body.receiverId = toObjectId(req.body.receiverId);
  }
  next();
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/messages');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, audio, video, and common document formats
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|mp3|wav|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Create a message - apply convertToObjectId middleware
router.post('/messages', authenticateToken, convertToObjectId, async (req, res) => {
  try {
    const { senderId, receiverId, text, type, fileUrl, fileName, fileSize } = req.body;
    
    // Convert string IDs to ObjectId
    const senderIdObj = toObjectId(senderId);
    const receiverIdObj = toObjectId(receiverId);
    
    if (!senderIdObj || !receiverIdObj || !text) {
      return res.status(400).json({ error: 'senderId, receiverId and text are required' });
    }

    const msg = await Message.create({ 
      senderId: senderIdObj, 
      receiverId: receiverIdObj, 
      text,
      type: type || 'text',
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null
    });
    
    // Populate sender and receiver info for frontend
    await msg.populate('senderId', 'username profilePicture');
    await msg.populate('receiverId', 'username profilePicture');
    
    // Emit socket event for real-time update - use string IDs for socket
    const io = req.app.get('io');
    
    // Convert ObjectId to string for socket emission and response
    const senderIdStr = senderIdObj.toString();
    const receiverIdStr = receiverIdObj.toString();
    
    const messageData = {
      ...msg.toObject(),
      senderId: senderIdStr,
      receiverId: receiverIdStr,
      timestamp: msg.createdAt.toISOString()
    };
    
    if (io) {
      io.to(receiverIdStr).emit('message_received', messageData);
      
      const roomId = [senderIdStr, receiverIdStr].sort().join('_');
      io.to(roomId).emit('message_received', messageData);
    }
    
    // Return message with proper string IDs and timestamp
    res.json({ message: messageData });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Upload file for message
router.post('/messages/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Determine file type based on mimetype
    let fileType = 'file';
    const mimetype = req.file.mimetype;
    if (mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (mimetype.startsWith('audio/')) {
      fileType = 'audio';
    } else if (mimetype.startsWith('video/')) {
      fileType = 'video';
    }

    const fileUrl = `/uploads/messages/${req.file.filename}`;
    
    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      type: fileType
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get messages between two users (userId and receiverId)
router.get('/messages/:userId/:receiverId', authenticateToken, async (req, res) => {
  try {
    const { userId, receiverId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Convert string IDs to ObjectId
    const userIdObj = toObjectId(userId);
    const receiverIdObj = toObjectId(receiverId);
    
    if (!userIdObj || !receiverIdObj) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }
    
    const messages = await Message.find({
      $or: [
        { senderId: userIdObj, receiverId: receiverIdObj },
        { senderId: receiverIdObj, receiverId: userIdObj }
      ]
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

    // Convert ObjectId to string for frontend
    const messagesWithStringIds = messages.map(msg => ({
      ...msg,
      senderId: msg.senderId?.toString?.() || msg.senderId,
      receiverId: msg.receiverId?.toString?.() || msg.receiverId
    }));

    // Reverse to show oldest first
    const reversedMessages = messagesWithStringIds.reverse();

    res.json(reversedMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark messages as read
router.put('/messages/read/:senderId/:receiverId', authenticateToken, async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    
    // Convert string IDs to ObjectId
    const senderIdObj = toObjectId(senderId);
    const receiverIdObj = toObjectId(receiverId);
    
    if (!senderIdObj || !receiverIdObj) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }
    
    await Message.updateMany(
      { 
        senderId: senderIdObj, 
        receiverId: receiverIdObj,
        isRead: false 
      },
      { isRead: true }
    );

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(senderId).emit('message_read', { readerId: receiverId });
    }

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get all conversations (latest message from each user)
router.get('/conversations/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Convert string ID to ObjectId
    const userIdObj = toObjectId(userId);
    
    if (!userIdObj) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Get all unique users the current user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userIdObj }, { receiverId: userIdObj }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$senderId', userIdObj] },
              then: '$receiverId',
              else: '$senderId'
            }
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userIdObj] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $match: {
          _id: { $ne: userIdObj } // Exclude current user from conversations
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          profilePicture: '$user.profilePicture',
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

export default router;
