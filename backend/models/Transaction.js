import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: false,
  },

  // ✅ Fixed Field: make Plaid ID optional + allow null duplicates safely
  plaidTransactionId: {
    type: String,
    unique: true,
    sparse: true, // allows multiple nulls
    default: null, // default null if not provided
  },

  // ✅ Added: a fallback internal transactionId for manual entries
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
    default: function () {
      // Generates unique ID for manual entries (no Plaid)
      return "txn_" + new Date().getTime().toString() + "_" + Math.floor(Math.random() * 10000);
    },
  },

  name: { type: String, required: true },
  amount: { type: Number, required: true },
  isoCurrencyCode: { type: String, default: "INR" },
  date: { type: Date, required: true },

  // ✅ Fix: ensure category is always an array of strings, not nested arrays
  category: {
    type: [String],
    default: ["Other"],
    set: (v) => (Array.isArray(v) ? v.flat() : [v]), // flatten nested arrays
  },

  pending: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Optional: remove duplicate indexes if they already exist
transactionSchema.index({ plaidTransactionId: 1 }, { unique: true, sparse: true });
transactionSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Transaction", transactionSchema);
