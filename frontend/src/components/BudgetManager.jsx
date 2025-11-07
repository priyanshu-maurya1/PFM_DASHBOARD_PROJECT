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

// Category List
const categories = [
  'Food and Drink',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Other',
];

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8A2BE2', '#DC143C', '#FF69B4'];

const BudgetManager = ({ refresh }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '' });

  // Fetch Budgets
  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/budgets');
      setBudgets(response.data.budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [refresh]);

  // Add New Budget
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/budgets', formData);
      toast.success('Budget saved successfully');
      setFormData({ category: '', amount: '' });
      setShowForm(false);
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to save budget');
    }
  };

  // Delete Budget
  const handleDelete = async (budgetId) => {
    try {
      await api.delete(`/api/budgets/${budgetId}`); // ✅ fixed template literal
      toast.success('Budget deleted');
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  // Compute frequency and total per category
  const categoryData = categories
    .map((cat) => {
      const catBudgets = budgets.filter((b) => b.category === cat);
      const totalAmount = catBudgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
      return {
        category: cat,
        frequency: catBudgets.length,
        total: totalAmount,
      };
    })
    .filter((data) => data.frequency > 0 || data.total > 0);

  // Total budget summary
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Budgets</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
        >
          {showForm ? 'Cancel' : 'Add Budget'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border rounded px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Budget Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="border rounded px-3 py-2"
              required
              min="0"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Save Budget
          </button>
        </form>
      )}

      {/* Budget List */}
      <div className="space-y-3">
        {budgets.length === 0 ? (
          <p className="text-gray-500 text-center">No budgets set for this month.</p>
        ) : (
          budgets.map((budget) => (
            <div
              key={budget._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded"
            >
              <div>
                <span className="font-medium">{budget.category}</span>
                <span className="text-gray-500 ml-2">₹{Number(budget.amount).toFixed(2)}</span>
              </div>
              <button
                onClick={() => handleDelete(budget._id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Budget Summary */}
      {budgets.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h4 className="text-md font-semibold mb-2">Budget Summary</h4>
          <p className="text-gray-700">Total Budget: ₹{totalBudget.toFixed(2)}</p>
        </div>
      )}

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Frequency Chart */}
          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h4 className="text-sm font-semibold mb-3">Category Frequency</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequency" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-50 rounded-lg p-4 shadow">
            <h4 className="text-sm font-semibold mb-3">Budget Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> // ✅ fixed key syntax
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;
