import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['enrollment', 'transaction', 'budget', 'system', 'message', 'reminder', 'lms'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  link: { type: String }, // Optional link to related page
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data like transaction amount, course name, etc.
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium' 
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

// TTL index to auto-delete old notifications after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

export default mongoose.model('Notification', notificationSchema);

