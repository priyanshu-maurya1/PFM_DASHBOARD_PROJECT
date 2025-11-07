import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import PlaidItem from '../models/PlaidItem.js';
import dotenv from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { categorizeTransaction } from '../utils/categorizer.js';

const router = express.Router();

dotenv.config({ override: true, quiet: true });
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET_KEY,
      "Plaid-Version": process.env.PLAID_API_VERSION
    }
  }
});

const client = new PlaidApi(configuration);

// Get spending by category
router.get('/api/dashboard/spending-by-category', authenticateToken, async (req, res) => {
  try {
    const plaidItem = await PlaidItem.findOne({ userId: req.user._id });
    if (!plaidItem) {
      return res.status(404).json({ error: 'No Plaid account found' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = now.toISOString().split('T')[0];
    const startDate = startOfMonth.toISOString().split('T')[0];

    const txResp = await client.transactionsGet({
      access_token: plaidItem.accessToken,
      start_date: startDate,
      end_date: endDate
    });

    const categoryTotals = {};
    txResp.data.transactions.forEach(tx => {
      if (tx.amount > 0) { // Only expenses
        const category = categorizeTransaction(tx);
        categoryTotals[category] = (categoryTotals[category] || 0) + tx.amount;
      }
    });

    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }));

    res.json({ data: chartData });
  } catch (err) {
    console.error('Error fetching spending data:', err);
    res.status(500).json({ error: 'Failed to fetch spending data' });
  }
});

// Get income vs expense summary
router.get('/api/dashboard/income-vs-expense', authenticateToken, async (req, res) => {
  try {
    const plaidItem = await PlaidItem.findOne({ userId: req.user._id });
    if (!plaidItem) {
      return res.status(404).json({ error: 'No Plaid account found' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = now.toISOString().split('T')[0];
    const startDate = startOfMonth.toISOString().split('T')[0];

    const txResp = await client.transactionsGet({
      access_token: plaidItem.accessToken,
      start_date: startDate,
      end_date: endDate
    });

    let totalIncome = 0;
    let totalExpense = 0;

    txResp.data.transactions.forEach(tx => {
      if (tx.amount < 0) {
        totalIncome += Math.abs(tx.amount);
      } else {
        totalExpense += tx.amount;
      }
    });

    res.json({
      income: Math.round(totalIncome * 100) / 100,
      expense: Math.round(totalExpense * 100) / 100,
      net: Math.round((totalIncome - totalExpense) * 100) / 100
    });
  } catch (err) {
    console.error('Error fetching income/expense data:', err);
    res.status(500).json({ error: 'Failed to fetch income/expense data' });
  }
});

// Get monthly summary (last 6 months)
router.get('/api/dashboard/monthly-summary', authenticateToken, async (req, res) => {
  try {
    const plaidItem = await PlaidItem.findOne({ userId: req.user._id });
    if (!plaidItem) {
      return res.status(404).json({ error: 'No Plaid account found' });
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const endDate = now.toISOString().split('T')[0];
    const startDate = sixMonthsAgo.toISOString().split('T')[0];

    const txResp = await client.transactionsGet({
      access_token: plaidItem.accessToken,
      start_date: startDate,
      end_date: endDate
    });

    const monthlyData = {};
    
    txResp.data.transactions.forEach(tx => {
      const month = tx.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      
      if (tx.amount < 0) {
        monthlyData[month].income += Math.abs(tx.amount);
      } else {
        monthlyData[month].expense += tx.amount;
      }
    });

    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: Math.round(data.income * 100) / 100,
      expense: Math.round(data.expense * 100) / 100
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.json({ data: chartData });
  } catch (err) {
    console.error('Error fetching monthly data:', err);
    res.status(500).json({ error: 'Failed to fetch monthly data' });
  }
});

export default router;