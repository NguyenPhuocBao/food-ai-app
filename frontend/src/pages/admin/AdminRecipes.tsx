import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import EmptyState from '../../components/admin/EmptyState';
import { useConfirm } from '../../contexts/ConfirmContext';

function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const AdminRecipes = () => {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const loadAllRecipes = async () => {
      try {
        const res = await api.get('/admin/recipes?limit=1000');
        const recipes = (res.data.data || []).sort((a: any, b: any) => a.id - b.id);
        setAllRecipes(recipes);
      } catch {
        toast.error('Loi tai cong thuc');
      } finally {
        setLoading(false);
      }
    };

    void loadAllRecipes();
  }, []);

  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredRecipes(allRecipes);
    } else {
      const normalizedSearch = removeAccents(searchInput.toLowerCase());
      const filtered = allRecipes.filter((recipe) => {
        const title = removeAccents(String(recipe.title || '').toLowerCase());
        const foodName = removeAccents(String(recipe.food?.name || '').toLowerCase());
        return title.includes(normalizedSearch) || foodName.includes(normalizedSearch);
      });
      setFilteredRecipes(filtered);
    }
    setPage(1);
  }, [searchInput, allRecipes]);

  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / itemsPerPage));
  const paginatedRecipes = filteredRecipes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Xóa công thức',
      message: 'Bạn có chắc muốn xóa công thức này?',
      confirmText: 'Xóa công thức',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/admin/recipes/${id}`);
      setAllRecipes((prev) => prev.filter((item) => item.id !== id));
      toast.success('Da xoa cong thuc');
    } catch {
      toast.error('Xoa cong thuc that bai');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (allRecipes.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="Khong c? cong thuc"
        description="He thong chua co du lieu cong thuc."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Quan ly cong thuc
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sach cong thuc nau an</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tim kiem cong thuc..."
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
                <th className="px-6 py-4 text-left">Mon an</th>
                <th className="px-6 py-4 text-left">Tieu de</th>
                <th className="px-6 py-4 text-left">Do kho</th>
                <th className="px-6 py-4 text-left">Thoi gian (phut)</th>
                <th className="px-6 py-4 text-left">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedRecipes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Khong c? du lieu
                  </td>
                </tr>
              ) : (
                paginatedRecipes.map((recipe) => (
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
                          title="Xem chi tiet"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(recipe.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Xoa"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
          >
            Truoc
          </button>
          <span className="text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminRecipes;
