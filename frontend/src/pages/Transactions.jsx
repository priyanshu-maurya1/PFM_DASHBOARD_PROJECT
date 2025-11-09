import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#0EA5A4",
  "#6B7280",
];

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(n || 0)
  );

export default function Transactions() {
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // used to re-key animated sections
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Other",
  });

  // --- Normalizer: safe conversion to string category
  const normalize = (cat) => {
    try {
      if (Array.isArray(cat)) {
        // if array like ["Food and Drink"]
        return (cat[0] || "Other").toString();
      }
      if (cat === null || cat === undefined) return "Other";
      if (typeof cat === "object") {
        // if an object, attempt to read name property fallback to Other
        return (cat.name || cat.label || "Other").toString();
      }
      return cat.toString();
    } catch {
      return "Other";
    }
  };

  // fetch
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/user-transactions");
      // backend might return { transactions: [...] } or just array — safe guard
      const tx = res?.data?.transactions ?? res?.data ?? [];
      setTransactions(Array.isArray(tx) ? tx : []);
      setRefreshTrigger((p) => p + 1);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // add / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount) || 0,
        date: formData.date,
        // send single string category to backend (backend had array schema earlier — adjust accordingly)
        category:
          Array.isArray(formData.category) ? formData.category[0] : formData.category,
      };

      if (editingId) {
        await api.put(`/api/user-transactions/${editingId}`, payload);
        toast.success("Transaction updated");
      } else {
        // generate fallback transactionId (backend expects unique transactionId sometimes)
        payload.transactionId = `txn_${Math.random().toString(36).slice(2, 10)}`;
        await api.post("/api/user-transactions", payload);
        toast.success("Transaction added");
      }

      // reset
      setFormData({
        name: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "Other",
      });
      setShowModal(false);
      setEditingId(null);
      await fetchTransactions();
    } catch (err) {
      console.error("Error saving transaction:", err);
      toast.error("Failed to save transaction");
    }
  };

  const handleEdit = (t) => {
    setFormData({
      name: t.name || "",
      amount: Math.abs(t.amount || 0).toString(),
      date: new Date(t.date || Date.now()).toISOString().split("T")[0],
      category: t.category || "Other",
    });
    setEditingId(t._id || t.id || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/api/user-transactions/${id}`);
      toast.success("Deleted");
      fetchTransactions();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete");
    }
  };

  // totals (income detection: case-insensitive)
  const incomeWords = ["income", "incomes", "salary", "earning", "earnings"];

  const totalIncome = transactions
    .filter((t) =>
      incomeWords.includes(normalize(t.category).toLowerCase())
    )
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(
      (t) => !incomeWords.includes(normalize(t.category).toLowerCase())
    )
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const net = totalIncome - totalExpense;

  // category summary for charts
  const categoryMap = transactions.reduce((acc, t) => {
    const cat = normalize(t.category);
    const amt = Math.abs(Number(t.amount || 0));
    if (!acc[cat]) acc[cat] = { category: cat, frequency: 0, total: 0 };
    // count even if amount is zero (if you want otherwise, add check)
    acc[cat].frequency += 1;
    acc[cat].total += amt;
    return acc;
  }, {});

  const categoryData = Object.values(categoryMap);

  return (
    <div
      className={`min-h-screen flex transition-all duration-500 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-blue-50 via-sky-100 to-white text-gray-900"
      }`}
    >
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col mt-20 p-8 items-center">
          <motion.div
            key={refreshTrigger}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`w-full max-w-6xl rounded-3xl p-8 border backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${
              isDark ? "bg-gray-900/70 border-gray-800" : "bg-white/60 border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-200/60 pb-3">
              <div className="flex items-center gap-3">
                <DollarSign size={32} className={isDark ? "text-blue-300" : "text-blue-600"} />
                <div>
                  <h3 className={`text-3xl font-semibold ${isDark ? "text-white" : "text-sky-800"}`}>
                    Manage Transactions
                  </h3>
                  <p className="text-sm text-gray-500">View, edit, and analyze your financial records</p>
                </div>
              </div>

              <motion.button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    amount: "",
                    date: new Date().toISOString().split("T")[0],
                    category: "Other",
                  });
                  setShowModal(true);
                }}
                whileHover={{ scale: 1.06, boxShadow: "0 0 20px rgba(59,130,246,0.6)" }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-full shadow-lg transition-all"
              >
                <PlusCircle size={16} /> Add Transaction
              </motion.button>
            </div>

            {/* Transaction list */}
            <div className="rounded-xl p-4 mb-6">
              {loading ? (
                <div className="py-6 text-center text-gray-400">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="py-6 text-center text-gray-500">No transactions yet.</div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice().reverse().slice(0, 10).map((t) => (
                    <div
                      key={t._id || t.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        isDark ? "bg-gray-800/70 border-gray-700" : "bg-white/70 border-gray-200"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-lg">{t.name}</p>
                        <p className="text-sm text-gray-500">
                          {fmt(t.amount)} • {new Date(t.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(t)} className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700">
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(t._id || t.id)} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Overview */}
            <div className={`rounded-2xl p-5 mb-6 backdrop-blur-sm ${isDark ? "bg-gray-900/60 border border-gray-700" : "bg-gradient-to-r from-white/90 to-blue-50/60 border border-blue-100"}`}>
              <h4 className="font-semibold text-xl mb-3 text-sky-700 flex items-center gap-2"><TrendingUp size={18} /> Budget Overview</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-2xl font-bold">{fmt(totalIncome)}</span>
                  <p className="text-sm text-gray-500">Total Income</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-600 text-2xl font-bold">{fmt(totalExpense)}</span>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(net)}</span>
                  <p className="text-sm text-gray-500">Net Balance</p>
                </div>
              </div>
            </div>

            {/* Charts */}
            {categoryData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`rounded-2xl p-4 border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white/60 border-gray-200"} shadow-lg`}>
                  <h5 className="font-semibold mb-2 text-sky-700">Transaction Frequency & Amount</h5>
                  <div style={{ width: "100%", height: 420 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} margin={{ top: 15, right: 30, left: 5, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(val) => (typeof val === "number" ? fmt(val) : val)} />
                        <Legend />
                        <Bar dataKey="frequency" name="Frequency" fill="#3B82F6" barSize={20} />
                        <Bar dataKey="total" name="Total" fill="#10B981" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`rounded-2xl p-4 border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white/60 border-gray-200"} shadow-lg`}>
                  <h5 className="font-semibold mb-2 text-sky-700">Category Spending</h5>
                  <div style={{ width: "100%", height: 420 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => fmt(val)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-[6px] pt-[10vh]">
            <motion.div initial={{ y: 40, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }} className="relative w-full max-w-sm p-5 rounded-xl bg-white/60 dark:bg-gray-900/80 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{editingId ? "Edit Transaction" : "Add Transaction"}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input required type="text" placeholder="Transaction Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm" />
                <input required type="number" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm" />
                <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm" />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-3 py-2 text-sm">
                  {["Income", "Incomes", "Food and Drink", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="flex justify-end gap-3 pt-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm shadow">{editingId ? "Update" : "Add"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
