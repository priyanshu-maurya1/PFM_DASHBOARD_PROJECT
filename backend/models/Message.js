import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient message queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
