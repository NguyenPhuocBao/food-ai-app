import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import EmptyState from '../../components/admin/EmptyState';

function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const AdminFoods = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Number(searchParams.get('page') || 1);
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number.isFinite(initialPage) && initialPage > 0 ? Math.floor(initialPage) : 1);
  const itemsPerPage = 20;

  useEffect(() => {
    const loadAllFoods = async () => {
      try {
        const res = await api.get('/admin/foods?limit=1000');
        const foods = (res.data.data || []).sort((a: any, b: any) => a.id - b.id);
        setAllFoods(foods);
      } catch {
        toast.error('Loi tai mon an');
      } finally {
        setLoading(false);
      }
    };

    void loadAllFoods();
  }, []);

  const filteredFoods = useMemo(() => {
    if (!searchInput.trim()) return allFoods;
    const normalizedSearch = removeAccents(searchInput.toLowerCase());
    return allFoods.filter((food) =>
      removeAccents(String(food.name || '').toLowerCase()).includes(normalizedSearch),
    );
  }, [allFoods, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filteredFoods.length / itemsPerPage));
  const paginatedFoods = filteredFoods.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    if (loading) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, page, totalPages]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (page > 1) nextParams.set('page', String(page));
    if (searchInput.trim()) nextParams.set('q', searchInput.trim());

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [page, searchInput, searchParams, setSearchParams]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xoa mon an nay?')) return;

    try {
      await api.delete(`/admin/foods/${id}`);
      setAllFoods((prev) => prev.filter((item) => item.id !== id));
      toast.success('Da xoa mon an');
    } catch {
      toast.error('Xoa mon an that bai');
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

  if (allFoods.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="Khong c? mon an"
        description="He thong chua co du lieu mon an."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Quan ly mon an
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sach mon an trong he thong</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tim kiem mon an..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 transition"
        />
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Ten mon</th>
                <th className="px-6 py-4 text-left">Danh muc</th>
                <th className="px-6 py-4 text-left">Calo</th>
                <th className="px-6 py-4 text-left">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedFoods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Khong c? du lieu
                  </td>
                </tr>
              ) : (
                paginatedFoods.map((food) => (
                  <tr key={food.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{food.id}</td>
                    <td
                      className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                      onClick={() =>
                        navigate(`/admin/foods/${food.id}${location.search}`, {
                          state: { from: `${location.pathname}${location.search}` },
                        })
                      }
                    >
                      {food.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{food.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{food.calories}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleDelete(food.id)} className="text-red-600 hover:text-red-800 transition">
                        <Trash size={18} />
                      </button>
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

export default AdminFoods;
