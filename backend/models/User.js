// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, default: null }, // Made optional for OTP verification flow
  profilePicture: { type: String, default: '' },
  // User role - 'user' for regular users, 'admin' for administrators
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // Group memberships - tracks which groups the user belongs to
  groups: [{
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['member', 'admin'], default: 'member' }
  }],
  // WhatsApp group link for new users
  whatsappGroupLink: { type: String, default: '' },
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
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  // Email verification fields
  otp: { type: String },
  otpExpiry: { type: Date },
isEmailVerified: { type: Boolean, default: false },

  createdAt:{ type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);