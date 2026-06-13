import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedModules: [{
    moduleIndex: Number,
    completedAt: Date
  }],
  testScore: {
    type: Number,
    default: null
  },
  testAttempts: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String,
    default: null
  }
});

// Index for efficient queries
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1 });

export default mongoose.model('Enrollment', enrollmentSchema);

