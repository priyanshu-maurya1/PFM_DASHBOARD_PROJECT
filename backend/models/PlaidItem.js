import mongoose from 'mongoose';

const plaidItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessToken: { type: String, required: true }, // Should be encrypted in production
  itemId: { type: String, required: true, unique: true },
  institutionId: { type: String, required: true },
  institutionName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('PlaidItem', plaidItemSchema);