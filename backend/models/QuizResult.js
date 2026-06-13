// models/QuizResult.js
import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  college: {
    type: String,
    default: ''
  },
  course: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: ''
  },
  week: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  correct: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  answers: {
    type: [Number],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
quizResultSchema.index({ userId: 1, week: 1 });
quizResultSchema.index({ score: -1 });
quizResultSchema.index({ week: 1 });

export default mongoose.model('QuizResult', quizResultSchema);

