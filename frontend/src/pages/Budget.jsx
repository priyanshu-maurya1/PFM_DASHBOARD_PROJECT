import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, PieChart, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../utils/api';

const Budget = () => {
  const [activeTab, setActiveTab] = useState('set');
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', date: '', description: '' });

  const categories = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other'];
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const addBudget = () => {
    // Persist budget to backend
    (async () => {
      if (!(newCategory && newAmount && parseFloat(newAmount) > 0)) return;

      try {
        const res = await api.post('/api/budgets', { category: newCategory, amount: parseFloat(newAmount) });
        const saved = res.data && res.data.budget ? res.data.budget : null;
        if (saved) {
          // replace or append
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

  const addExpense = () => {
    (async () => {
      if (!(expenseForm.category && expenseForm.amount && expenseForm.date)) return;

      try {
        const payload = {
          // transactionRoutes will set userId server-side
          name: expenseForm.description || expenseForm.category,
          amount: parseFloat(expenseForm.amount),
          date: expenseForm.date,
          category: expenseForm.category
        };

        const res = await api.post('/api/user-transactions', payload);
        // response for single create is { transaction }
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

  const deleteExpense = (id) => {
    // We don't have a dedicated transaction delete here; remove locally and optionally call backend if _id known
    setExpenses(prev => prev.filter(e => e.id !== id && e._id !== id));
  };

  // Load budgets and recent transactions on mount
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

  const getCategoryTotal = (category) => {
    return expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;

  const getInsights = () => {
    const insights = [];
    
    budgets.forEach(budget => {
      const spent = getCategoryTotal(budget.category);
      const percentage = (spent / budget.amount) * 100;
      
      if (percentage > 100) {
        insights.push({
          type: 'danger',
          category: budget.category,
          message: `You've exceeded your ${budget.category} budget by $${(spent - budget.amount).toFixed(2)}. Consider reducing spending in this category.`
        });
      } else if (percentage > 80) {
        insights.push({
          type: 'warning',
          category: budget.category,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget. Monitor spending closely.`
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
          message: `You've used ${overallPercentage.toFixed(0)}% of your total monthly budget. Be cautious with remaining spending.`
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
        message: `${highestCategory.category} is your highest expense category at $${highestCategory.spent.toFixed(2)}.`
      });
    }

    return insights.length > 0 ? insights : [{ type: 'info', category: 'Overall', message: 'Start tracking expenses to get personalized insights!' }];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-2">Budget</h1>
            <p className="text-blue-100">{currentMonth}</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-50">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Budget</p>
                  <p className="text-3xl font-bold text-gray-800">${totalBudget.toFixed(2)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-800">${totalSpent.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-red-500 opacity-20" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Remaining</p>
                  <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(remaining).toFixed(2)}
                  </p>
                </div>
                {remaining >= 0 ? 
                  <TrendingDown className="w-12 h-12 text-green-500 opacity-20" /> :
                  <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
                }
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('set')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'set' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Set Monthly Budget
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'track' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Track Performance
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'insights' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Budget Insights
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'set' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Budget Category</h2>
                  <div className="flex gap-4">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={addBudget}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" /> Add
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-800">Your Budget Categories</h3>
                  {budgets.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No budget categories yet. Add one above!</p>
                  ) : (
                    budgets.map(budget => (
                      <div key={budget.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{budget.category}</p>
                            <p className="text-2xl font-bold text-blue-600">${budget.amount.toFixed(2)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteBudget(budget.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'track' && (
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-xl">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Expense</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Category</option>
                      {budgets.map(b => (
                        <option key={b.id} value={b.category}>{b.category}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={addExpense}
                    className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Expense
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">Budget vs Actual</h3>
                  {budgets.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Set your budget first to track performance!</p>
                  ) : (
                    budgets.map(budget => {
                      const spent = getCategoryTotal(budget.category);
                      const percentage = Math.min((spent / budget.amount) * 100, 100);
                      const isOver = spent > budget.amount;
                      
                      return (
                        <div key={budget.id} className="bg-white p-6 rounded-lg shadow-md">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-800">{budget.category}</h4>
                            <span className={`font-bold ${isOver ? 'text-red-600' : 'text-gray-800'}`}>
                              ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isOver ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {isOver ? 
                              `Over budget by $${(spent - budget.amount).toFixed(2)}` :
                              `$${(budget.amount - spent).toFixed(2)} remaining`
                            }
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {expenses.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-800">Recent Expenses</h3>
                    {expenses.slice().reverse().slice(0, 10).map(expense => (
                      <div key={expense.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{expense.category}</p>
                          <p className="text-sm text-gray-600">{expense.date} {expense.description && `- ${expense.description}`}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xl font-bold text-red-600">-${expense.amount.toFixed(2)}</p>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
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
                  <PieChart className="w-8 h-8 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-800">AI-Powered Budget Insights</h2>
                </div>

                {getInsights().map((insight, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-xl shadow-md border-l-4 ${
                      insight.type === 'danger' ? 'bg-red-50 border-red-500' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                      insight.type === 'success' ? 'bg-green-50 border-green-500' :
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 ${
                        insight.type === 'danger' ? 'text-red-500' :
                        insight.type === 'warning' ? 'text-yellow-500' :
                        insight.type === 'success' ? 'text-green-500' :
                        'text-blue-500'
                      }`}>
                        {insight.type === 'success' ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{insight.category}</h3>
                        <p className="text-gray-700">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {budgets.length > 0 && expenses.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-gray-800 mb-3">Tips for Better Budgeting</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>Review your spending weekly to stay on track with your budget goals.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>Set aside an emergency fund equal to 3-6 months of expenses.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>Look for patterns in overspending and adjust your budget accordingly.</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;
