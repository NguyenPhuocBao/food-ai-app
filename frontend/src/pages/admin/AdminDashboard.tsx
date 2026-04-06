import { useEffect, useState } from 'react';
import { getSystemStats, getWeeklyStats } from '../../services/admin.service';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Utensils, Camera, Activity } from 'lucide-react';
import AdvancedStatCard from '../../components/admin/AdvancedStatCard';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [categoryData] = useState([
    { name: 'Món nước', value: 12 },
    { name: 'Món khô', value: 15 },
    { name: 'Tráng miệng', value: 3 },
    { name: 'Đồ uống', value: 2 },
  ]);

  useEffect(() => {
    const fetch = async () => {
      const statsData = await getSystemStats();
      setStats(statsData);
      const weekly = await getWeeklyStats();
      setWeeklyData(weekly.daily || []);
    };
    fetch();
  }, []);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Tổng quan hệ thống hôm nay</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdvancedStatCard title="Tổng người dùng" value={stats.users.total} icon={Users} color="#3B82F6" trend={5} />
        <AdvancedStatCard title="Món ăn" value={stats.foods.total} icon={Utensils} color="#10B981" />
        <AdvancedStatCard title="Lượt scan" value={stats.scans} icon={Camera} color="#F59E0B" trend={-2} />
        <AdvancedStatCard title="Bữa ăn hôm nay" value={stats.meals.today} icon={Activity} color="#EF4444" trend={8} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📈 Xu hướng calo 7 ngày qua</h2>
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={weeklyData}>
              <defs><linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '16px' }} />
              <Area type="monotone" dataKey="calories" stroke="#8884d8" fillOpacity={1} fill="url(#colorCal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">🍕 Danh mục món ăn</h2>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-800 dark:text-white">🏆 Top món ăn phổ biến</h2></div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr><th className="px-6 py-3 text-left">Tên món</th><th className="px-6 py-3 text-left">Danh mục</th><th className="px-6 py-3 text-left">Calo</th><th className="px-6 py-3 text-left">Lượt thích</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {stats.popularFoods.map((food: any) => (
                <tr key={food.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{food.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{food.category}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{food.calories}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">❤️ {food.popularity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;