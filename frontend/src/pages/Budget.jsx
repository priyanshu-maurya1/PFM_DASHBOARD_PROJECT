// src/pages/Budget.jsx
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  PieChart as PieIcon,
  Plus,
  Trash2,
  Check,
  X
} from 'lucide-react';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from '../utils/api';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/**
 * Budget.jsx
 * - Preserves all original logic (budgets, expenses, insights, add/delete, load)
 * - UI updated to Soft Sky palette + Glassmorphism cards + subtle animations
 * - "Spending by Category" chart removed (no chart code present)
 *
 * Notes:
 * - Requires TailwindCSS and Framer Motion (you confirmed these)
 * - Uses existing Sidebar and Navbar components
 */

const Budget = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('set');
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', date: '', description: '' });

  const categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other'];
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // ---- addBudget ----
  const addBudget = () => {
    (async () => {
      if (!(newCategory && newAmount && parseFloat(newAmount) > 0)) return;

      try {
        const res = await api.post('/api/budgets', { category: newCategory, amount: parseFloat(newAmount) });
        const saved = res.data && res.data.budget ? res.data.budget : null;
        if (saved) {
          setBudgets(prev => {
            const existing = prev.find(b => b.category === saved.category);
            if (existing) return prev.map(p => p._id === saved._id || p.category === saved.category ? saved : p);
            return [...prev, saved];
          });
        }
        setNewCategory('');
        setNewAmount('');
      } catch (err) {
        console.error('Failed to save budget', err?.response?.data || err.message || err);
      }
    })();
  };

  // ---- deleteBudget ----
  const deleteBudget = (id) => {
    (async () => {
      try {
        await api.delete(`/api/budgets/${id}`);
        setBudgets(prev => prev.filter(b => b._id !== id && b.id !== id));
      } catch (err) {
        console.error('Failed to delete budget', err?.response?.data || err.message || err);
      }
    })();
  };

  // ---- addExpense ----
  const addExpense = () => {
    (async () => {
      if (!(expenseForm.category && expenseForm.amount && expenseForm.date)) return;

      try {
        const payload = {
          name: expenseForm.description || expenseForm.category,
          amount: parseFloat(expenseForm.amount),
          date: expenseForm.date,
          category: expenseForm.category
        };

        const res = await api.post('/api/user-transactions', payload);
        const tx = (res.data && (res.data.transaction || (Array.isArray(res.data.transactions) && res.data.transactions[0]))) || null;
        if (tx) {
          setExpenses(prev => [...prev, { id: tx._id || Date.now(), category: tx.category || payload.category, amount: tx.amount || payload.amount, date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : payload.date, description: payload.name }]);
        }

        setExpenseForm({ category: '', amount: '', date: '', description: '' });
      } catch (err) {
        console.error('Failed to add expense', err?.response?.data || err.message || err);
      }
    })();
  };

  // ---- deleteExpense ----
  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id && e._id !== id));
  };

  // ---- Load budgets and transactions ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [bRes, tRes] = await Promise.all([
          api.get('/api/budgets'),
          api.get('/api/user-transactions')
        ]);

        if (!mounted) return;

        const loadedBudgets = (bRes.data && bRes.data.budgets) || [];
        setBudgets(loadedBudgets.map(b => ({ ...b })));

        const txs = (tRes.data && tRes.data.transactions) || (Array.isArray(tRes.data) ? tRes.data : []);
        const mapped = txs.map(t => ({ id: t._id || Date.now(), _id: t._id, category: Array.isArray(t.category) ? t.category[0] : t.category, amount: t.amount, date: t.date ? new Date(t.date).toISOString().split('T')[0] : '' , description: t.name || '' }));
        setExpenses(mapped);
      } catch (err) {
        console.error('Failed to load budgets or transactions', err?.response?.data || err.message || err);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // ---- helpers ----
  const getCategoryTotal = (category) => {
    return expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = totalBudget - totalSpent;

  const getInsights = () => {
    const insights = [];
    budgets.forEach(budget => {
      const spent = getCategoryTotal(budget.category);
      const percentage = (spent / (budget.amount || 1)) * 100;

      if (percentage > 100) {
        insights.push({
          type: 'danger',
          category: budget.category,
          message: `You've exceeded your ${budget.category} budget by $${(spent - budget.amount).toFixed(2)}.`
        });
      } else if (percentage > 80) {
        insights.push({
          type: 'warning',
          category: budget.category,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget.`
        });
      } else if (percentage < 50 && spent > 0) {
        insights.push({
          type: 'success',
          category: budget.category,
          message: `Great job! You're only at ${percentage.toFixed(0)}% of your ${budget.category} budget.`
        });
      }
    });

    if (totalBudget > 0) {
      const overallPercentage = (totalSpent / totalBudget) * 100;
      if (overallPercentage > 90) {
        insights.push({
          type: 'danger',
          category: 'Overall',
          message: `You've used ${overallPercentage.toFixed(0)}% of your total monthly budget.`
        });
      }
    }

    const highestCategory = budgets.reduce((max, b) => {
      const spent = getCategoryTotal(b.category);
      return spent > (max.spent || 0) ? { category: b.category, spent } : max;
    }, {});

    if (highestCategory.category) {
      insights.push({
        type: 'info',
        category: highestCategory.category,
        message: `${highestCategory.category} is your highest expense category.`
      });
    }

    return insights.length > 0 ? insights : [{ type: 'info', category: 'Overall', message: 'Start tracking expenses to get personalized insights!' }];
  };

  // ---- UI styles:
  // Soft Sky + Glassmorphism applied via Tailwind classes below.

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100' : 'bg-gradient-to-br from-sky-50 via-sky-100 to-white text-gray-900'}`}>
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />

        <main className="p-6 pt-20 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`rounded-2xl overflow-hidden border ${
              isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white/50 border-gray-200'
            } shadow-xl backdrop-blur-md`}
          >

            {/* Header */}
            <div className="p-8 border-b dark:border-gray-800 flex items-start justify-between gap-6" style={{ background: isDark ? 'linear-gradient(180deg, rgba(17,24,39,0.35), rgba(17,24,39,0.12))' : 'linear-gradient(180deg, rgba(238,246,255,0.85), rgba(227,246,255,0.6))' }}>
              <div>
                <h1 className="text-3xl font-bold text-sky-700 dark:text-blue-300">Budget</h1>
                <p className="text-sm text-gray-500">{currentMonth}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/60' : 'bg-white/60'} shadow-sm`}>
                  <DollarSign className="text-sky-600" size={28} />
                </div>
              </div>
            </div>

            {/* Overview cards */}
            <div className={`p-6 ${isDark ? 'bg-gray-900/20' : 'bg-transparent'} grid grid-cols-1 md:grid-cols-3 gap-6`}>
              <div className={`p-5 rounded-xl ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/60 border border-white/50'} shadow-sm backdrop-blur-md flex items-center justify-between`}>
                <div>
                  <p className="text-sm text-gray-300">Total Budget</p>
                  <p className="text-2xl font-bold text-sky-700">${(totalBudget || 0).toFixed(2)}</p>
                </div>
                <div className="text-sky-500 opacity-30"><DollarSign size={36} /></div>
              </div>

              <div className={`p-5 rounded-xl ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/60 border border-white/50'} shadow-sm backdrop-blur-md flex items-center justify-between`}>
                <div>
                  <p className="text-sm text-gray-300">Total Spent</p>
                  <p className="text-2xl font-bold text-rose-600">${(totalSpent || 0).toFixed(2)}</p>
                </div>
                <div className="text-red-500 opacity-30"><TrendingUp size={36} /></div>
              </div>

              <div className={`p-5 rounded-xl ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/60 border border-white/50'} shadow-sm backdrop-blur-md flex items-center justify-between`}>
                <div>
                  <p className="text-sm text-gray-300">Remaining</p>
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Math.abs(remaining || 0).toFixed(2)}</p>
                </div>
                <div className="opacity-30">
                  {remaining >= 0 ? <TrendingDown size={36} className="text-green-500" /> : <AlertCircle size={36} className="text-red-500" />}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className={`flex border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
              <button onClick={() => setActiveTab('set')} className={`flex-1 py-4 px-6 font-semibold ${activeTab === 'set' ? (isDark ? 'bg-gray-900 text-sky-300 border-b-2 border-sky-500' : 'bg-white text-sky-700 border-b-2 border-sky-600') : (isDark ? 'text-gray-300 hover:bg-gray-900/40' : 'text-gray-600 hover:bg-gray-50')}`}>Set Monthly Budget</button>
              <button onClick={() => setActiveTab('track')} className={`flex-1 py-4 px-6 font-semibold ${activeTab === 'track' ? (isDark ? 'bg-gray-900 text-sky-300 border-b-2 border-sky-500' : 'bg-white text-sky-700 border-b-2 border-sky-600') : (isDark ? 'text-gray-300 hover:bg-gray-900/40' : 'text-gray-600 hover:bg-gray-50')}`}>Track Performance</button>
              <button onClick={() => setActiveTab('insights')} className={`flex-1 py-4 px-6 font-semibold ${activeTab === 'insights' ? (isDark ? 'bg-gray-900 text-sky-300 border-b-2 border-sky-500' : 'bg-white text-sky-700 border-b-2 border-sky-600') : (isDark ? 'text-gray-300 hover:bg-gray-900/40' : 'text-gray-600 hover:bg-gray-50')}`}>Budget Insights</button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {activeTab === 'set' && (
                <div className="space-y-6">
                  <div className={`${isDark ? 'bg-gray-900/30' : 'bg-sky-50/80'} p-6 rounded-xl backdrop-blur-md border ${isDark ? 'border-gray-800' : 'border-white/60'}`}>
                    <h2 className="text-2xl font-bold mb-4 text-sky-700">Add Budget Category</h2>
                    <div className="flex gap-4 flex-wrap">
                      <select value={newCategory} onChange={(e)=>setNewCategory(e.target.value)} className="p-3 border rounded-lg flex-1 max-w-xs bg-white/40 dark:bg-gray-800/40">
                        <option value="">Select Category</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <input type="number" value={newAmount} onChange={(e)=>setNewAmount(e.target.value)} placeholder="Amount" className="p-3 border rounded-lg w-40 bg-white/40 dark:bg-gray-800/40" />
                      <button onClick={addBudget} className="bg-gradient-to-r from-sky-500 to-teal-400 text-white px-5 py-3 rounded-lg flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold">Your Budget Categories</h3>
                    {budgets.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No budget categories yet. Add one above!</p>
                    ) : (
                      budgets.map(budget => (
                        <div key={budget.id || budget._id} className={`p-4 rounded-lg shadow-md flex items-center justify-between ${isDark ? 'bg-gray-900/30 border border-gray-800' : 'bg-white/70 border border-white/50'}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/30 dark:bg-gray-800/40 rounded-full flex items-center justify-center">
                              <DollarSign className="text-sky-600" />
                            </div>
                            <div>
                              <p className="font-semibold">{budget.category}</p>
                              <p className="text-2xl font-bold text-sky-700">${(budget.amount || 0).toFixed(2)}</p>
                            </div>
                          </div>
                          <button onClick={() => deleteBudget(budget.id || budget._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'track' && (
                <div className="space-y-6">
                  <div className="bg-white/60 dark:bg-gray-900/30 p-6 rounded-xl backdrop-blur-md border border-white/40 dark:border-gray-800">
                    <h2 className="text-2xl font-bold mb-4 text-sky-700">Add Expense</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <select value={expenseForm.category} onChange={(e)=>setExpenseForm({...expenseForm, category: e.target.value})} className="p-3 border rounded-lg bg-white/40 dark:bg-gray-800/40">
                        <option value="">Category</option>
                        {budgets.map(b => <option key={b._id || b.id} value={b.category}>{b.category}</option>)}
                      </select>
                      <input type="number" placeholder="Amount" value={expenseForm.amount} onChange={(e)=>setExpenseForm({...expenseForm, amount: e.target.value})} className="p-3 border rounded-lg bg-white/40 dark:bg-gray-800/40" />
                      <input type="date" value={expenseForm.date} onChange={(e)=>setExpenseForm({...expenseForm, date: e.target.value})} className="p-3 border rounded-lg bg-white/40 dark:bg-gray-800/40" />
                      <input type="text" placeholder="Description (optional)" value={expenseForm.description} onChange={(e)=>setExpenseForm({...expenseForm, description: e.target.value})} className="p-3 border rounded-lg bg-white/40 dark:bg-gray-800/40" />
                    </div>
                    <button onClick={addExpense} className="mt-4 bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform">
                      <Plus className="w-5 h-5" /> Add Expense
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Budget vs Actual</h3>
                    {budgets.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Set your budget first to track performance!</p>
                    ) : (
                      budgets.map(budget => {
                        const spent = getCategoryTotal(budget.category);
                        const percentage = Math.min((spent / (budget.amount || 1)) * 100, 100);
                        const isOver = spent > (budget.amount || 0);

                        return (
                          <div key={budget.id || budget._id} className={`p-6 rounded-lg ${isDark ? 'bg-gray-900/30 border border-gray-800' : 'bg-white/70 border border-white/50'} shadow-md`}>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{budget.category}</h4>
                              <span className={`font-bold ${isOver ? 'text-red-600' : 'text-gray-800'}`}>${spent.toFixed(2)} / ${(budget.amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {isOver ? `Over budget by $${(spent - (budget.amount || 0)).toFixed(2)}` : `$${((budget.amount || 0) - spent).toFixed(2)} remaining`}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {expenses.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold">Recent Expenses</h3>
                      {expenses.slice().reverse().slice(0, 10).map(expense => (
                        <div key={expense.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-900/30 border border-gray-800' : 'bg-white/70 border border-white/50'} shadow-md flex items-center justify-between`}>
                          <div>
                            <p className="font-semibold">{expense.category}</p>
                            <p className="text-sm text-gray-600">{expense.date} {expense.description && `- ${expense.description}`}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-xl font-bold text-red-600">-${expense.amount.toFixed(2)}</p>
                            <button onClick={() => deleteExpense(expense.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <PieIcon className="w-8 h-8 text-indigo-600" />
                    <h2 className="text-2xl font-bold">AI-Powered Budget Insights</h2>
                  </div>

                  {getInsights().map((insight, index) => (
                    <div key={index} className={`p-6 rounded-xl shadow-md border-l-4 ${insight.type === 'danger' ? 'bg-red-50 border-red-500' : insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : insight.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}`}>
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{insight.type === 'success' ? <Check /> : <AlertCircle />}</div>
                        <div>
                          <h3 className="font-semibold mb-1">{insight.category}</h3>
                          <p className="text-gray-700">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {budgets.length > 0 && expenses.length > 0 && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md">
                      <h3 className="font-bold text-gray-800 mb-3">Tips for Better Budgeting</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>Review your spending weekly to stay on track with your budget goals.</li>
                        <li>Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.</li>
                        <li>Set aside an emergency fund equal to 3–6 months of expenses.</li>
                        <li>Look for patterns in overspending and adjust your budget accordingly.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Budget;
