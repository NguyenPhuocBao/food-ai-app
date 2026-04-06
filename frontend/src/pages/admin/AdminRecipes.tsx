import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';

const AdminRecipes = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/recipes?page=${page}&limit=20&search=${search}`);
      setRecipes(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) { toast.error('Lỗi tải công thức'); } finally { setLoading(false); }
  };
  useEffect(() => { loadRecipes(); }, [page, search]);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };
  const handleDelete = async (id: number) => { if (confirm('Xóa công thức này?')) { await api.delete(`/admin/recipes/${id}`); toast.success('Đã xóa'); loadRecipes(); } };

  if (loading && page===1) {
    return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div>;
  }

  if (!loading && recipes.length === 0) {
    return <EmptyState icon={Search} title="Không có công thức" description="Chưa có công thức nào trong hệ thống." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Quản lý công thức</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách công thức nấu ăn</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm công thức..."
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
              <tr><th className="px-6 py-4 text-left">ID</th><th className="px-6 py-4 text-left">Món ăn</th><th className="px-6 py-4 text-left">Tiêu đề</th><th className="px-6 py-4 text-left">Độ khó</th><th className="px-6 py-4 text-left">Thời gian (phút)</th><th className="px-6 py-4 text-left">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{recipe.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{recipe.food?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{recipe.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{recipe.difficulty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{recipe.totalTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(recipe.id)} className="text-red-600 hover:text-red-800 transition" title="Xóa">
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

export default AdminRecipes;