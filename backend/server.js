import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import { connectRedis } from './config/redis.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import plaidRoutes from './routes/plaidRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import emailRoutes from './routes/email.js';
import messagesRoutes from './routes/messages.js';
import groupsRoutes from './routes/groups.js';
import uploadRoutes from './routes/upload.js';
import lmsRoutes from './routes/lmsRoutes.js';
import notificationRoutes from './routes/notifications.js';
import quizRoutes from './routes/quizRoutes.js';
import serverStatsRoutes from './routes/serverStats.js';
import { seedTestUser } from './utils/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists at startup
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(__dirname, 'uploads', 'profiles');
const messagesDir = path.join(__dirname, 'uploads', 'messages');
console.log('Server upload directory:', uploadsDir);

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  } else {
    console.log('Uploads directory already exists:', uploadsDir);
  }
  
  // Create profiles subdirectory
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
    console.log('Created profiles directory:', profilesDir);
  } else {
    console.log('Profiles directory already exists:', profilesDir);
  }
  
  // Create messages subdirectory
  if (!fs.existsSync(messagesDir)) {
    fs.mkdirSync(messagesDir, { recursive: true });
    console.log('Created messages directory:', messagesDir);
  } else {
    console.log('Messages directory already exists:', messagesDir);
  }
} catch (err) {
  console.error('Error creating uploads directories:', err);
}

// Ensure resources directory exists for PDF resources
const resourcesDir = path.join(__dirname, 'resources');
console.log('Server resources directory:', resourcesDir);

try {
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
    console.log('Created resources directory:', resourcesDir);
  } else {
    console.log('Resources directory already exists:', resourcesDir);
  }
} catch (err) {
  console.error('Error creating resources directory:', err);
}

dotenv.config({ override: true, quiet: true });
console.log("Frontend URL: ", process.env.FRONTEND_URL)

const app = express();
const PORT = process.env.PORT || 5000;

// Get the frontend URL from environment or use default local development URLs

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const getCorsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Socket.io setup with CORS and improved configuration
const io = new Server(httpServer, {
  cors: {
    origin: getCorsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  // Enable both WebSocket and polling transports
  transports: ["polling", "websocket"],
  // Allow fallback to polling if WebSocket fails
  allowEIO3: true,
  // Ping timeout to detect disconnected clients
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User setup - join with their user ID
  socket.on('setup', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    }
  });

  // Join a chat room (between two users)
  socket.on('join_chat', ({ userId, receiverId }) => {
    const roomId = [userId, receiverId].sort().join('_');
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Handle new message
  socket.on('new_message', (msg) => {
    // Emit to receiver's personal room
    io.to(msg.receiverId).emit('message_received', msg);
    
    // Also emit to the chat room
    const roomId = [msg.senderId, msg.receiverId].sort().join('_');
    io.to(roomId).emit('message_received', msg);
    
    console.log('Message sent:', msg);
  });

  // Typing indicators
  socket.on('typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('typing', { senderId });
  });

  socket.on('stop_typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('stop_typing', { senderId });
  });

  // Read receipts
  socket.on('message_read', ({ messageId, readerId, senderId }) => {
    io.to(senderId).emit('message_read', { messageId, readerId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (let [key, value] of connectedUsers.entries()) {
      if (value === socket.id) {
        connectedUsers.delete(key);
        console.log(`User ${key} disconnected`);
        break;
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Connect to databases
import mongoose from 'mongoose';
mongoose.set('strictQuery', true);
connectDB();

// Auto-seed test user on startup (development only)
mongoose.connection.on('connected', async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🚀 Seeding test user (dev mode)...');
    const result = await seedTestUser();
    if (result.seeded) {
      console.log('✅ Test user ready: test@gjglobal.com / password123');
    }
  } else {
    console.log('Production mode - skipping test user seeding');
  }
});

connectRedis();

app.use(
  cors({
    credentials: true,
    origin: getCorsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200 // For legacy browser support
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve resource files (PDFs, etc.)
app.use('/resources', express.static(path.join(__dirname, 'resources')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plaid', plaidRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
// Email route used by frontend Email component
app.use('/api/email', emailRoutes);
// Messages (chat) routes
app.use('/', messagesRoutes);

// Group routes\napp.use('/api/groups', groupsRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// LMS routes
app.use('/api/lms', lmsRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Quiz routes
app.use('/api/quiz', quizRoutes);

// Server stats routes
app.use('/api/stats', serverStatsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'PFM Dashboard API is running', timestamp: new Date().toISOString() });
});

// Debug endpoint to inspect cookies / headers (dev helper)
app.get('/api/debug/session', (req, res) => {
  res.json({
    cookies: req.cookies || {},
    headers: {
      origin: req.headers.origin,
      cookie: req.headers.cookie,
      authorization: req.headers.authorization
    }
  });
});

// Debug endpoint to check OAuth configuration
app.get('/api/debug/oauth', (req, res) => {
  res.json({
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ? 'set (hidden)' : 'not set',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'set (hidden)' : 'not set',
      demoMode: process.env.GOOGLE_OAUTH_DEMO
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID ? process.env.LINKEDIN_CLIENT_ID.substring(0, 5) + '...' : 'not set',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'set (hidden)' : 'not set'
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID ? 'set (hidden)' : 'not set',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ? 'set (hidden)' : 'not set'
    },
    backendUrl: process.env.BACKEND_URL,
    frontendUrl: process.env.FRONTEND_URL
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large! Maximum size is 100MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files! Maximum is 100 files.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  }
  
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
