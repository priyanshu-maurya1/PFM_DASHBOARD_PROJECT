import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const SpendingChart = ({ refresh }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/dashboard/spending-by-category');
      const allData = response.data.data.filter(item => item.value > 0);
      const total = allData.reduce((sum, item) => sum + item.value, 0);
      
      // Separate data based on percentage threshold
      const mainData = allData.filter(item => (item.value / total) >= 0.005); // >= 0.5%
      const smallData = allData.filter(item => (item.value / total) < 0.005); // < 0.5%
      
      setData({ main: mainData, small: smallData });
    } catch (error) {
      console.error('Error fetching spending data:', error);
      setData({ main: [], small: [] });
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
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.main?.length === 0 && data.small?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
        <p className="text-gray-500">No spending data available for this month.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.main}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              const percentage = percent * 100;
              return `${name} ${percentage.toFixed(0)}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.main?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
        </PieChart>
      </ResponsiveContainer>
      
      {data.small?.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-600 mb-2">Categories occupying &lt;0.5% are not shown in the pie chart:</p>
          <div className="flex flex-wrap gap-2">
            {data.small.map((item, index) => (
              <span key={index} className="text-xs bg-gray-200 px-2 py-1 rounded">
                {item.name}: ${item.value.toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingChart;