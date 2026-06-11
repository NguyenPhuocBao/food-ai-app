import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Trash, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import EmptyState from '../../components/admin/EmptyState';
import { useConfirm } from '../../contexts/ConfirmContext';

const MEAL_TIME_OPTIONS = [
  { value: 'BREAKFAST', label: 'Sang' },
  { value: 'LUNCH', label: 'Trua' },
  { value: 'DINNER', label: 'Toi' },
  { value: 'SNACK', label: 'An nhe' },
];

const MEAL_ROLE_OPTIONS = [
  { value: 'MAIN', label: 'Mon chinh' },
  { value: 'STAPLE', label: 'Tinh bot' },
  { value: 'SIDE', label: 'Mon phu' },
  { value: 'SOUP', label: 'Canh/sup' },
  { value: 'DESSERT', label: 'Trang mieng' },
  { value: 'DRINK', label: 'Do uong' },
  { value: 'SNACK', label: 'An nhe' },
];

const GOAL_OPTIONS = [
  { value: 'WEIGHT_LOSS', label: 'Giam can' },
  { value: 'MAINTENANCE', label: 'Giu can' },
  { value: 'WEIGHT_GAIN', label: 'Tang can' },
  { value: 'MUSCLE_GAIN', label: 'Tang co' },
];

const COOKING_METHOD_OPTIONS = [
  { value: '', label: 'Chua phan loai' },
  { value: 'BOILED', label: 'Luoc' },
  { value: 'STEAMED', label: 'Hap' },
  { value: 'GRILLED', label: 'Nuong' },
  { value: 'STIR_FRIED', label: 'Xao' },
  { value: 'FRIED', label: 'Chien' },
  { value: 'BRAISED', label: 'Kho' },
  { value: 'SOUP', label: 'Nuoc/canh' },
  { value: 'RAW', label: 'Tuoi/song' },
];

const PORTION_TYPE_OPTIONS = [
  { value: '', label: 'Chua phan loai' },
  { value: 'FULL_MEAL', label: 'Bua day du' },
  { value: 'COMPONENT', label: 'Thanh phan bua an' },
  { value: 'LIGHT', label: 'Khau phan nhe' },
];

const emptyFoodForm = {
  name: '',
  category: '',
  description: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  mealTimeTags: [] as string[],
  mealRoles: [] as string[],
  goalTags: [] as string[],
  cookingMethod: '',
  portionType: '',
};

function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const AdminFoods = () => {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Number(searchParams.get('page') || 1);
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number.isFinite(initialPage) && initialPage > 0 ? Math.floor(initialPage) : 1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyFoodForm);
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
    const confirmed = await confirm({
      title: 'Xóa món ăn',
      message: 'Bạn có chắc muốn xóa món ăn này?',
      confirmText: 'Xóa món',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/admin/foods/${id}`);
      setAllFoods((prev) => prev.filter((item) => item.id !== id));
      toast.success('Da xoa mon an');
    } catch {
      toast.error('Xoa mon an that bai');
    }
  };

  const toggleArrayValue = (field: 'mealTimeTags' | 'mealRoles' | 'goalTags', value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const resetCreateForm = () => setCreateForm(emptyFoodForm);

  const handleCreateFood = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = createForm.name.trim();
    const category = createForm.category.trim();
    const calories = Number(createForm.calories);
    const protein = Number(createForm.protein);
    const fat = Number(createForm.fat);
    const carbs = Number(createForm.carbs);

    if (!name || !category || !Number.isFinite(calories) || calories <= 0) {
      toast.error('Nhap ten mon, danh muc va calories hop le');
      return;
    }

    if (![protein, fat, carbs].every((value) => Number.isFinite(value) && value >= 0)) {
      toast.error('Protein, fat va carbs phai la so khong am');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/admin/foods', {
        ...createForm,
        name,
        category,
        calories,
        protein,
        fat,
        carbs,
      });
      const newFood = response.data.data;
      setAllFoods((prev) => [newFood, ...prev].sort((a: any, b: any) => a.id - b.id));
      setShowCreateModal(false);
      resetCreateForm();
      toast.success('Da tao mon an');
      navigate(`/admin/foods/${newFood.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Tao mon an that bai');
    } finally {
      setCreating(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Quan ly mon an
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Danh sach mon an trong he thong</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700"
        >
          <Plus size={18} /> Them mon an
        </button>
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
          {allFoods.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={Search}
                title="Khong co mon an"
                description="He thong chua co du lieu mon an. Bam Them mon an de tao mon moi."
              />
            </div>
          ) : (
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
          )}
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Them mon an</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Nhap thong tin dinh duong theo 1 khau phan nguoi truong thanh.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Ten mon</label>
                  <input
                    value={createForm.name}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                    placeholder="Com ga luoc"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Danh muc</label>
                  <input
                    value={createForm.category}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                    placeholder="Com, Mon nuoc, Trang mieng..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Mo ta / ghi chu khau phan</label>
                <textarea
                  value={createForm.description}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-24 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  placeholder="Vi du: 150g com + 120g ga luoc bo da + rau."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['calories', 'Calories', 'kcal'],
                  ['protein', 'Protein', 'g'],
                  ['fat', 'Fat', 'g'],
                  ['carbs', 'Carbs', 'g'],
                ].map(([field, label, unit]) => (
                  <div key={field}>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step={field === 'calories' ? '1' : '0.1'}
                        value={createForm[field as 'calories' | 'protein' | 'fat' | 'carbs']}
                        onChange={(event) => setCreateForm((prev) => ({ ...prev, [field]: event.target.value }))}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-12 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['isVegetarian', 'Mon chay'],
                  ['isVegan', 'Thuan chay'],
                  ['isGlutenFree', 'Khong gluten'],
                ].map(([field, label]) => (
                  <label key={field} className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    {label}
                    <input
                      type="checkbox"
                      checked={Boolean(createForm[field as 'isVegetarian' | 'isVegan' | 'isGlutenFree'])}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, [field]: event.target.checked }))}
                      className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                ))}
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Bua phu hop</p>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_TIME_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => toggleArrayValue('mealTimeTags', option.value)}
                        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                          createForm.mealTimeTags.includes(option.value)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Vai tro mon</p>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_ROLE_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => toggleArrayValue('mealRoles', option.value)}
                        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                          createForm.mealRoles.includes(option.value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Muc tieu phu hop</p>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => toggleArrayValue('goalTags', option.value)}
                        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                          createForm.goalTags.includes(option.value)
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Cach che bien</label>
                  <select
                    value={createForm.cookingMethod}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, cookingMethod: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  >
                    {COOKING_METHOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Kieu khau phan</label>
                  <select
                    value={createForm.portionType}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, portionType: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                  >
                    {PORTION_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="rounded-2xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? 'Dang tao...' : 'Tao mon an'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
