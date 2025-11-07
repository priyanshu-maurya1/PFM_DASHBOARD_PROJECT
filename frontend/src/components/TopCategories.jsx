import { useState, useEffect } from 'react';
import api from '../utils/api';

const TopCategories = ({ refresh }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/spending-by-category');
      const all = res.data.data || [];
      // sort descending by value
      const sorted = all.sort((a, b) => b.value - a.value);
      setData(sorted.slice(0, 8));
    } catch (err) {
      console.error('Error fetching top categories:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Top Categories</h3>
        <p className="text-gray-500">No category data available. Connect accounts or add transactions.</p>
      </div>
    );
  }

  const total = data.reduce((s, i) => s + i.value, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Categories</h3>
      <ul className="space-y-3">
        {data.map((cat, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{cat.name}</p>
              <p className="text-xs text-gray-500">{cat.count ?? ''} transactions</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">${cat.value.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{total > 0 ? ((cat.value / total) * 100).toFixed(1) : 0}%</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopCategories;
