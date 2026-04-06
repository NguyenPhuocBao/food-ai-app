import { useEffect, useState } from 'react';
import { getFoodsAdmin, deleteFood } from '../../services/admin.service';
import { Search, Trash, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';
import { useNavigate } from 'react-router-dom';

const AdminFoods = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const loadFoods = async () => {
    setLoading(true);
    try {
      const res = await getFoodsAdmin(page, 20, search);
      setFoods(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) { toast.error('Lỗi tải món ăn'); } finally { setLoading(false); }
  };
  useEffect(() => { loadFoods(); }, [page, search]);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };
  const handleDelete = async (id: number) => { if (confirm('Xóa món ăn này?')) { await deleteFood(id); toast.success('Đã xóa'); loadFoods(); } };

  if (loading && page===1) {
    return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div>;
  }

  if (!loading && foods.length === 0) {
    return <EmptyState icon={Search} title="Không có món ăn" description="Chưa có món ăn nào trong hệ thống." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Quản lý món ăn</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách các món ăn trong hệ thống</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 transition"
          />
        </div>
        <button onClick={handleSearch} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all">
          Tìm kiếm
        </button>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr><th className="px-6 py-4 text-left">ID</th><th className="px-6 py-4 text-left">Tên món</th><th className="px-6 py-4 text-left">Danh mục</th><th className="px-6 py-4 text-left">Calo</th><th className="px-6 py-4 text-left">Ngày tạo</th><th className="px-6 py-4 text-left">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {foods.map((food) => (
                <tr key={food.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{food.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    <button onClick={() => navigate(`/admin/foods/${food.id}`)} className="hover:text-blue-600 hover:underline cursor-pointer">
                      {food.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{food.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{food.calories}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(food.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(food.id)} className="text-red-600 hover:text-red-800 transition" title="Xóa">
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">← Trước</button>
        <span className="text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">Sau →</button>
      </div>
    </div>
  );
};

export default AdminFoods;