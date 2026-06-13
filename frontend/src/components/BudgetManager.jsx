import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ResponsiveContainer,
} from 'recharts';

const categories = [
  'Food and Drink',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Other',
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8A2BE2', '#DC143C', '#FF69B4'];

const BudgetManager = ({ refresh }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user-transactions');
      setExpenses(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [refresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/user-transactions', {
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
      });
      toast.success('Expense added successfully');
      setFormData({
        name: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      await api.delete(`/api/user-transactions/${expenseId}`);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  // Safe: handles category as string OR array
  const getCategoryLabel = (category) => {
    if (!category) return 'Uncategorized';
    if (Array.isArray(category)) return category.join(', ');
    return category;
  };

  // Build chart data — frequency + total per category
  const categoryData = categories
    .map((cat, index) => {
      const matched = expenses.filter((e) => {
        if (!e.category) return false;
        const cats = Array.isArray(e.category) ? e.category : [e.category];
        return cats.some(
          (c) =>
            c.toLowerCase().includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(c.toLowerCase())
        );
      });
      return {
        category: cat,
        frequency: matched.length,
        total: matched.reduce((sum, e) => sum + Number(e.amount || 0), 0),
        color: COLORS[index % COLORS.length],
      };
    })
    .filter((d) => d.frequency > 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{payload[0].name}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>₹{Number(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{label}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>Transactions: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading expenses...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Expense Tracker</h2>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {/* Total Spent Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex justify-between items-center">
        <span className="text-blue-700 font-medium text-sm">Total Spent</span>
        <span className="text-blue-900 font-bold text-xl">₹{totalExpenses.toFixed(2)}</span>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
        >
          <h3 className="font-semibold text-gray-700 text-sm">New Expense</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Expense name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
              required
              min="0"
              step="0.01"
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Add Expense
          </button>
        </form>
      )}

      {/* Expense List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            All Expenses ({expenses.length})
          </h3>
        </div>
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            No expenses recorded yet. Add your first expense above.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <li
                key={expense._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{expense.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {getCategoryLabel(expense.category)} &middot; {formatDate(expense.date)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">
                    ₹{Number(expense.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Charts — only shown when there is data */}
      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Pie Chart — Spending by Category */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ percent }) =>
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                  }
                  labelLine={false}
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart — Frequency per Category */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Transaction Frequency</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 10, left: -15, bottom: 65 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  angle={-40}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="frequency" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

    </div>
  );
};

export default BudgetManager;