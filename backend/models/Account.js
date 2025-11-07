import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plaidItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlaidItem', required: true },
  plaidAccountId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mask: { type: String },
  type: { type: String, required: true },
  subtype: { type: String },
  currentBalance: { type: Number },
  isoCurrencyCode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Account', accountSchema);