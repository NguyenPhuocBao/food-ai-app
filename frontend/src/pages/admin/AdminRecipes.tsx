import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';

function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const AdminRecipes = () => {
  const navigate = useNavigate();
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    const loadAllRecipes = async () => {
      try {
        const res = await api.get('/admin/recipes?limit=1000');
        const recipes = res.data.data;
        recipes.sort((a: any, b: any) => a.id - b.id);
        setAllRecipes(recipes);
      } catch (error) {
        toast.error('Lỗi tải công thức');
      } finally {
        setLoading(false);
      }
    };
    loadAllRecipes();
  }, []);

  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredRecipes(allRecipes);
    } else {
      const normalizedSearch = removeAccents(searchInput.toLowerCase());
      const filtered = allRecipes.filter((recipe) =>
        removeAccents(recipe.title.toLowerCase()).includes(normalizedSearch) ||
        (recipe.food?.name && removeAccents(recipe.food.name.toLowerCase()).includes(normalizedSearch))
      );
      setFilteredRecipes(filtered);
    }
    setPage(1);
  }, [searchInput, allRecipes]);

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const paginatedRecipes = filteredRecipes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDelete = async (id: number) => {
    if (confirm('Xóa công thức này?')) {
      await api.delete(`/admin/recipes/${id}`);
      toast.success('Đã xóa');
      setAllRecipes((prev) => prev.filter(r => r.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (!loading && filteredRecipes.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="Không có công thức"
        description="Không tìm thấy công thức nào phù hợp."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Quản lý công thức
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sách công thức nấu ăn</p>
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm công thức (gõ không dấu cũng được)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 transition"
        />
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Món ăn</th>
                <th className="px-6 py-4 text-left">Tiêu đề</th>
                <th className="px-6 py-4 text-left">Độ khó</th>
                <th className="px-6 py-4 text-left">Thời gian (phút)</th>
                <th className="px-6 py-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedRecipes.map((recipe) => (
                <tr key={recipe.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{recipe.id}</td>
                  <td
                    className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                    onClick={() => navigate(`/admin/recipes/${recipe.foodId}`)}
                  >
                    {recipe.food?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{recipe.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{recipe.difficulty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{recipe.totalTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/admin/recipes/${recipe.foodId}`)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Xóa"
                      >
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
          >
            ← Trước
          </button>
          <span className="text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRecipes;