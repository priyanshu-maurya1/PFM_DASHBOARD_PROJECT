import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// ✅ Get all transactions for user
router.get("/api/user-transactions", authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(50);
    res.json({ transactions });
  } catch (err) {
    console.error("Error fetching user transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Compatibility endpoint used by frontend: return transactions as an array
router.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(100);

    // Return plain array (frontend expects an array at /api/transactions)
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions (compat):', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ✅ Add manual transaction (supports single object or array for bulk add)
router.post("/api/user-transactions", authenticateToken, async (req, res) => {
  try {
    const payload = req.body;

    // helper to normalize an incoming item into a Transaction doc shape
    const buildTransactionDoc = (item) => {
      const { name, amount, date, category, accountId } = item || {};

      const tx = {
        userId: req.user._id,
        transactionId: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        plaidTransactionId: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        name: name || "Manual Transaction",
        amount: Number.isFinite(Number(amount)) ? parseFloat(amount) : 0,
        date: date ? new Date(date) : new Date(),
        category: category ? (Array.isArray(category) ? category : [category]) : [],
        pending: false,
      };

      if (accountId) tx.accountId = accountId;
      return tx;
    };

    // If client posted an array of transactions, perform bulk insert
    if (Array.isArray(payload)) {
      if (payload.length === 0) {
        return res.status(400).json({ error: "Empty transactions array" });
      }

      const docs = payload.map(buildTransactionDoc);

      // insertMany with ordered:false lets us insert as many as possible even if some fail
      const inserted = await Transaction.insertMany(docs, { ordered: false });
      return res.json({ transactions: inserted });
    }

    // single transaction
    const doc = buildTransactionDoc(payload);
    const transaction = new Transaction(doc);
    await transaction.save();

    res.json({ transaction });
  } catch (err) {
    console.error("Error creating transaction:", err);
    // Duplicate key on unique index
    if (err && err.code === 11000) {
      // Try to return the existing document instead of a hard error when duplicate key occurs.
      try {
        const existing = await Transaction.findOne({
          $or: [
            { plaidTransactionId: doc.plaidTransactionId },
            { transactionId: doc.transactionId }
          ]
        });

        if (existing) return res.json({ transaction: existing, warning: 'Duplicate detected; returning existing transaction' });
      } catch (findErr) {
        console.error('Error fetching existing transaction after duplicate key:', findErr);
      }

      return res.status(409).json({ error: "Duplicate transaction detected", details: err.keyValue || err.message });
    }

    // Mongoose validation or cast errors
    if (err && (err.name === 'ValidationError' || err.name === 'CastError')) {
      return res.status(400).json({ error: 'Invalid transaction data', details: err.message });
    }

    res.status(500).json({ error: "Failed to create transaction", details: err.message });
  }
});

// ✅ Update transaction
router.put("/api/user-transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { name, amount, date, category } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        name,
        amount: parseFloat(amount),
        date: new Date(date),
        category: [category],
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ transaction });
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// ✅ Delete transaction
router.delete("/api/user-transactions/:id", authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;
