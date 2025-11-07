import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid, Cell, ResponsiveContainer
} from 'recharts';

const categories = [
  'Food and Drink', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Healthcare', 'Income', 'Other'
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9C27B0', '#E91E63', '#4CAF50', '#F44336'];

const TransactionManager = ({ refresh, onUpdate }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
  });

  // Fetch Transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user-transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refresh]);

  // Add or Update Transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, amount: parseFloat(formData.amount) };
      if (editingId) {
        await api.put(`/api/user-transactions/${editingId}`, data);
        toast.success('Transaction updated');
      } else {
        await api.post('/api/user-transactions', data);
        toast.success('Transaction added');
      }
      setFormData({
        name: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Other'
      });
      setShowForm(false);
      setEditingId(null);
      fetchTransactions();
      onUpdate && onUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error('Failed to save transaction: ' + message);
    }
  };

  // Edit Transaction
  const handleEdit = (transaction) => {
    setFormData({
      name: transaction.name,
      amount: Math.abs(transaction.amount).toString(),
      date: transaction.date.split('T')[0],
      category: transaction.category || 'Other',
    });
    setEditingId(transaction._id);
    setShowForm(true);
  };

  // Delete Transaction
  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/api/user-transactions/${id}`);
      toast.success('Transaction deleted');
      fetchTransactions();
      onUpdate && onUpdate();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  // Format currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(amount));

  // Totals
  const totalIncome = transactions.filter(t => t.category === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.category !== 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  // Category Summary
  const categoryData = categories.map(cat => {
    const filtered = transactions.filter(t => t.category === cat);
    const total = filtered.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    return { category: cat, frequency: filtered.length, total };
  }).filter(d => d.frequency > 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-5 bg-gray-200 w-1/3 mb-3 rounded"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Manage Transactions</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Other'
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
        >
          {showForm ? 'Cancel' : 'Add Transaction'}
        </button>
      </div>

      {/* Transaction Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <input
              type="text"
              placeholder="Transaction Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="border rounded px-3 py-2"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="border rounded px-3 py-2"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            {editingId ? 'Update' : 'Add'} Transaction
          </button>
        </form>
      )}

      {/* Transaction List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center">No transactions found.</p>
        ) : (
          transactions.slice().reverse().slice(0, 10).map(t => (
            <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{t.name}</span>
                <span className="text-gray-500 ml-2">
                  {formatCurrency(t.amount)} • {new Date(t.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Budget Statement */}
      {transactions.length > 0 && (
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-semibold text-md mb-2">Budget Statement</h4>
          <p className="text-green-600">Total Income: {formatCurrency(totalIncome)}</p>
          <p className="text-red-600">Total Expenses: {formatCurrency(totalExpense)}</p>
          <p className={`font-semibold mt-2 ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            Net Balance: {formatCurrency(netBalance)}
          </p>
        </div>
      )}

      {/* Charts */}
      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frequency & Total Bar Chart */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <h4 className="text-sm font-semibold mb-2">Transaction Frequency & Amount</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)} />
                <Legend />
                <Bar dataKey="frequency" fill="#8884d8" name="Frequency" />
                <Bar dataKey="total" fill="#82ca9d" name="Total Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <h4 className="text-sm font-semibold mb-2">Category Spending</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
