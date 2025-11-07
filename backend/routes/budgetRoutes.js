import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import Budget from '../models/Budget.js';

const router = express.Router();

// Get budgets for current month
router.get('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const budgets = await Budget.find({
      userId: req.user._id,
      month: currentMonth
    });
    
    res.json({ budgets });
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create or update budget
router.post('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const { category, amount } = req.body;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        category,
        month: currentMonth
      },
      {
        userId: req.user._id,
        category,
        amount,
        month: currentMonth
      },
      { upsert: true, new: true }
    );
    
    res.json({ budget });
  } catch (err) {
    console.error('Error saving budget:', err);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// Delete budget
router.delete('/api/budgets/:id', authenticateToken, async (req, res) => {
  try {
    await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

export default router;