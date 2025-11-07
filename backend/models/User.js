// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // store hashed password
  profilePicture: { type: String, default: '' },
  // Preferences and privacy settings
  preferences: {
    marketingEmails: { type: Boolean, default: false },
    shareAnonymizedData: { type: Boolean, default: false },
    notifications: {
      transactions: { type: Boolean, default: true },
      budgets: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true }
    }
  },
  twoFactorEnabled: { type: Boolean, default: false },
  createdAt:{ type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);