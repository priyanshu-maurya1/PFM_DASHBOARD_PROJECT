import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Privacy controls
  privacy: { 
    type: String, 
    enum: ['public', 'private', 'invite-only'], 
    default: 'public' 
  },
  inviteCode: { 
    type: String,
    unique: true,
    sparse: true 
  },
  allowPublicJoin: { 
    type: Boolean, 
    default: true 
  },
  members: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['member', 'admin'], default: 'member' }
  }],
  // Internship opportunities shared in this group
  internshipOpportunities: [{
    title: { type: String, required: true },
    company: { type: String },
    description: { type: String },
    requirements: [String],
    location: { type: String },
    duration: { type: String },
    stipend: { type: String },
    applyLink: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  // History for old/archived internships
  internshipHistory: [{
    title: { type: String, required: true },
    company: { type: String },
    description: { type: String },
    requirements: [String],
    location: { type: String },
    duration: { type: String },
    stipend: { type: String },
    applyLink: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null }
  }],
  // Workflow updates from admin
  workflowUpdates: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['announcement', 'update', 'reminder', 'general'],
      default: 'general' 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' }
  }],
  // History for old/archived updates
  updateHistory: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['announcement', 'update', 'reminder', 'general'],
      default: 'general' 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    archivedAt: { type: Date, default: null }
  }],
  // Group messages
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['text', 'image', 'file', 'audio', 'video', 'introduction'],
      default: 'text'
    },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    interests: [String], // For introduction messages
    isIntroduction: { type: Boolean, default: false }, // Flag for introduction messages
    createdAt: { type: Date, default: Date.now },
    isPinned: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ adminId: 1 });
groupSchema.index({ inviteCode: 1 });

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Generate invite code method
groupSchema.methods.generateInviteCode = function() {
  const crypto = require('crypto');
  this.inviteCode = crypto.randomBytes(8).toString('hex').toUpperCase();
  return this.inviteCode;
};

// Ensure virtuals are included in JSON
groupSchema.set('toJSON', { virtuals: true });
groupSchema.set('toObject', { virtuals: true });

export default mongoose.model('Group', groupSchema);

