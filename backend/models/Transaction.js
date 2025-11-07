import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: false },
  plaidTransactionId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  isoCurrencyCode: { type: String },
  date: { type: Date, required: true },
  category: [String],
  pending: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);