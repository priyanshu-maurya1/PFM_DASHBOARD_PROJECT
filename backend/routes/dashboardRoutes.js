import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config({ override: true, quiet: true });

// ✅ MOCK FINANCIAL DATA - No Plaid required, works for all users
const DEMO_SPENDING_BY_CATEGORY = [
  { name: 'Groceries', value: 452.30, color: '#3b82f6' },
  { name: 'Rent', value: 1200.00, color: '#ef4444' },
  { name: 'Dining Out', value: 289.75, color: '#f59e0b' },
  { name: 'Transportation', value: 156.40, color: '#8b5cf6' },
  { name: 'Entertainment', value: 89.20, color: '#10b981' },
  { name: 'Utilities', value: 245.80, color: '#f97316' },
  { name: 'Shopping', value: 178.60, color: '#ec4899' },
  { name: 'Subscriptions', value: 67.99, color: '#06b6d4' }
];

const DEMO_MONTHLY_SUMMARY = [
  { month: '2026-01', income: 4200, expense: 2850, net: 1350 },
  { month: '2026-02', income: 4500, expense: 3100, net: 1400 },
  { month: '2026-03', income: 4600, expense: 2950, net: 1650 },
  { month: '2026-04', income: 4550, expense: 3200, net: 1350 },
  { month: '2026-05', income: 4700, expense: 3050, net: 1650 },
  { month: '2026-06', income: 4850, expense: 3150, net: 1700 }
];

const DEMO_INCOME_EXPENSE = {
  income: 4850.00,
  expense: 3150.00,
  net: 1700.00
};

// ✅ FIXED: Dedicated dashboard profile endpoint (separate from auth/profile)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('🎯 DASHBOARD /api/dashboard/profile - User:', req.user.username);
    
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profilePicture: req.user.profilePicture,
        role: req.user.role,
        // Demo dashboard stats
        stats: {
          totalTransactions: 247,
          monthlyIncome: 4850,
          monthlyExpense: 3150,
          savingsRate: '35%'
        }
      }
    });
  } catch (error) {
    console.error('❌ Dashboard profile error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard profile' });
  }
});

// ✅ MOCK: Get spending by category (PIE CHART DATA)
router.get('/spending-by-category', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching mock spending data for:', req.user.username);
    res.json({ 
      success: true,
      data: DEMO_SPENDING_BY_CATEGORY,
      summary: {
        totalSpending: DEMO_SPENDING_BY_CATEGORY.reduce((sum, cat) => sum + cat.value, 0),
        topCategory: 'Rent (38%)'
      }
    });
  } catch (err) {
    console.error('Error fetching spending data:', err);
    res.status(500).json({ error: 'Failed to fetch spending data' });
  }
});

// ✅ MOCK: Get income vs expense summary (BAR CHART)
router.get('/income-vs-expense', authenticateToken, async (req, res) => {
  try {
    console.log('💰 Fetching mock income/expense for:', req.user.username);
    res.json({
      success: true,
      ...DEMO_INCOME_EXPENSE,
      categories: {
        incomeSources: ['Salary', 'Freelance', 'Investments'],
        incomeBreakdown: [3800, 800, 250],
        expenseCategories: ['Fixed', 'Variable', 'Discretionary'],
        expenseBreakdown: [2100, 750, 300]
      }
    });
  } catch (err) {
    console.error('Error fetching income/expense:', err);
    res.status(500).json({ error: 'Failed to fetch income/expense data' });
  }
});

// ✅ MOCK: Get monthly summary (LINE CHART - last 6 months)
router.get('/monthly-summary', authenticateToken, async (req, res) => {
  try {
    console.log('📈 Fetching mock monthly data for:', req.user.username);
    res.json({ 
      success: true,
      data: DEMO_MONTHLY_SUMMARY,
      trend: {
        avgIncome: 4567,
        avgExpense: 3050,
        savingsTrend: '+12%'
      }
    });
  } catch (err) {
    console.error('Error fetching monthly data:', err);
    res.status(500).json({ error: 'Failed to fetch monthly data' });
  }
});

// ✅ NEW: Get recent transactions (TABLE data)
router.get('/recent-transactions', authenticateToken, async (req, res) => {
  try {
    const demoTransactions = [
      { id: 'tx1', date: '2026-06-15', merchant: 'Whole Foods', category: 'Groceries', amount: 89.45, type: 'expense' },
      { id: 'tx2', date: '2026-06-14', merchant: 'Salary', category: 'Income', amount: 3800.00, type: 'income' },
      { id: 'tx3', date: '2026-06-13', merchant: 'Netflix', category: 'Subscription', amount: 15.99, type: 'expense' },
      { id: 'tx4', date: '2026-06-12', merchant: 'Gas Station', category: 'Transportation', amount: 56.20, type: 'expense' },
      { id: 'tx5', date: '2026-06-11', merchant: 'Freelance Client', category: 'Income', amount: 800.00, type: 'income' }
    ];
    
    res.json({
      success: true,
      data: demoTransactions,
      summary: { totalIncome: 4600, totalExpense: 161.64, net: 4438.36 }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
