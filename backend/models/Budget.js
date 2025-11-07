import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // Format: "YYYY-MM"
  createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure one budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);