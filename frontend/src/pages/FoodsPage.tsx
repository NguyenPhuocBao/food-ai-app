import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, Flame, Loader2, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories, getFoods, getPopularFoods, createCustomFood, getMyCustomFoods, bootstrapPopularFoods } from '../services/food.service';
import { getAssetUrl } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import type { FoodItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const FoodsPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const initialPage = Number(searchParams.get('page') || 1);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [popularFoods, setPopularFoods] = useState<FoodItem[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<{ category: string; _count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number.isFinite(initialPage) && initialPage > 0 ? Math.floor(initialPage) : 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
  });

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    const fetchMeta = async () => {
      const [categoryData, popularData, myCustomFoods] = await Promise.all([
        getCategories().catch(() => []),
        getPopularFoods(6).catch(() => []),
        getMyCustomFoods().catch(() => []),
      ]);
      setCategories(categoryData);
      setPopularFoods(popularData);
      setCustomFoods(myCustomFoods);
    };

    void fetchMeta();
  }, []);

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const result = await getFoods(page, 12, selectedCategory || undefined, debouncedSearch || undefined);
        setFoods(result.items);
        setTotalPages(result.pagination.totalPages || 1);
      } finally {
        setLoading(false);
      }
    };

    void fetchFoods();
  }, [page, selectedCategory, debouncedSearch]);

  useEffect(() => {
    if (loading) return;
    if (page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (page > 1) nextParams.set('page', String(page));
    if (selectedCategory) nextParams.set('category', selectedCategory);
    if (search.trim()) nextParams.set('q', search.trim());

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [page, search, selectedCategory, searchParams, setSearchParams]);

  const handleCreateCustomFood = async () => {
    const calories = Number(customForm.calories);
    const protein = Number(customForm.protein);
    const fat = Number(customForm.fat);
    const carbs = Number(customForm.carbs);

    if (!customForm.name.trim() || !Number.isFinite(calories) || !Number.isFinite(protein) || !Number.isFinite(fat) || !Number.isFinite(carbs)) {
      toast.error(isEn ? 'Please enter full custom food information' : 'Nhập đủ thông tin món cá nhân');
      return;
    }

    setCreatingCustom(true);
    try {
      await createCustomFood({
        name: customForm.name.trim(),
        calories,
        protein,
        fat,
        carbs,
      });
      setCustomForm({ name: '', calories: '', protein: '', fat: '', carbs: '' });
      toast.success(isEn ? 'Custom food created' : 'Đã tạo món cá nhân');
      const [myFoods, result] = await Promise.all([
        getMyCustomFoods().catch(() => []),
        getFoods(page, 12, selectedCategory || undefined, debouncedSearch || undefined),
      ]);
      setCustomFoods(myFoods);
      setFoods(result.items);
      setTotalPages(result.pagination.totalPages || 1);
    } catch {
      toast.error(isEn ? 'Cannot create custom food' : 'Không thể tạo món cá nhân');
    } finally {
      setCreatingCustom(false);
    }
  };

  const handleBootstrapPopularFoods = async () => {
    setBootstrapping(true);
    try {
      const result = await bootstrapPopularFoods(240);
      toast.success(isEn ? `Added ${result.inserted} popular foods` : `Đã bổ sung ${result.inserted} món phổ biến`);
      const [categoryData, popularData] = await Promise.all([
        getCategories().catch(() => []),
        getPopularFoods(6).catch(() => []),
      ]);
      setCategories(categoryData);
      setPopularFoods(popularData);
    } catch {
      toast.error(isEn ? 'Cannot bootstrap popular foods catalog' : 'Không bootstrap được danh mục món phổ biến');
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <section className="rounded-[32px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.28),_transparent_34%),linear-gradient(135deg,_#0f172a,_#111827_55%,_#14532d)] text-white shadow-xl">
        <div className="px-8 py-10 md:px-10 md:py-12 flex flex-col lg:flex-row gap-8 justify-between">
          <div className="max-w-2xl">
            <p className="text-emerald-200 font-bold text-sm tracking-[0.2em] uppercase mb-4">{isEn ? 'Food Library' : 'Thư viện món ăn'}</p>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              {isEn ? 'Explore foods and recipes on FoodAI' : 'Khám phá món ăn và xem công thức ngay trên FoodAI'}
            </h1>
            <p className="text-emerald-50/90 mt-4 max-w-xl leading-relaxed">
              {isEn
                ? 'Find foods by category, view nutrition details, check recipes, and add directly to your diary.'
                : 'Tìm nhanh món ăn theo danh mục, xem chi tiết dinh dưỡng, đọc công thức nấu và thêm trực tiếp vào nhật ký ăn uống.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 min-w-[280px]">
            <div className="rounded-[24px] bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <p className="text-sm text-emerald-100">{isEn ? 'Popular foods' : 'Món nổi bật'}</p>
              <p className="text-3xl font-black mt-2">{popularFoods.length}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <p className="text-sm text-emerald-100">{isEn ? 'Categories' : 'Danh mục'}</p>
              <p className="text-3xl font-black mt-2">{categories.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={isEn ? 'Search foods...' : 'Tìm món ăn...'}
                className="w-full rounded-2xl border-0 bg-gray-50 pl-11 pr-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="mt-5">
              <p className="text-sm font-black text-gray-900 mb-3">{isEn ? 'Categories' : 'Danh mục'}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-colors ${
                    !selectedCategory ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isEn ? 'All' : 'Tất cả'}
                </button>
                {categories.map((item) => (
                  <button
                    key={item.category}
                    onClick={() => {
                      setSelectedCategory(item.category);
                      setPage(1);
                    }}
                    className={`px-3 py-2 rounded-full text-xs font-bold transition-colors ${
                      selectedCategory === item.category ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-amber-500" />
              <p className="font-black text-gray-900">{isEn ? 'Popular foods' : 'Món nổi bật'}</p>
            </div>
            <div className="space-y-3">
              {popularFoods.map((food) => (
                <Link
                  key={food.id}
                  to={`/foods/${food.id}${location.search}`}
                  state={{ from: `${location.pathname}${location.search}` }}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center overflow-hidden shrink-0">
                    {food.imageUrl ? (
                      <img src={getAssetUrl(food.imageUrl)} alt={food.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-emerald-500">{food.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{food.name}</p>
                    <p className="text-xs text-gray-400">{food.calories} kcal</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="font-black text-gray-900">{isEn ? 'Custom food' : 'Món cá nhân'}</p>
            <input
              value={customForm.name}
              onChange={(event) => setCustomForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder={isEn ? 'Food name' : 'Tên món'}
              className="w-full rounded-xl bg-gray-50 border-0 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={customForm.calories}
                onChange={(event) => setCustomForm((prev) => ({ ...prev, calories: event.target.value }))}
                placeholder="Kcal"
                className="w-full rounded-xl bg-gray-50 border-0 px-3 py-2 text-sm"
              />
              <input
                value={customForm.protein}
                onChange={(event) => setCustomForm((prev) => ({ ...prev, protein: event.target.value }))}
                placeholder="Protein"
                className="w-full rounded-xl bg-gray-50 border-0 px-3 py-2 text-sm"
              />
              <input
                value={customForm.carbs}
                onChange={(event) => setCustomForm((prev) => ({ ...prev, carbs: event.target.value }))}
                placeholder="Carbs"
                className="w-full rounded-xl bg-gray-50 border-0 px-3 py-2 text-sm"
              />
              <input
                value={customForm.fat}
                onChange={(event) => setCustomForm((prev) => ({ ...prev, fat: event.target.value }))}
                placeholder="Fat"
                className="w-full rounded-xl bg-gray-50 border-0 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleCreateCustomFood}
              disabled={creatingCustom}
              className="w-full rounded-xl bg-emerald-500 text-white text-sm font-bold py-2 hover:bg-emerald-600 disabled:opacity-60"
            >
              {creatingCustom ? (isEn ? 'Creating...' : 'Đang tạo...') : (isEn ? 'Create custom food' : 'Tạo món cá nhân')}
            </button>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {customFoods.slice(0, 6).map((food) => (
                <div key={food.id} className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900">{food.name}</p>
                  <p className="text-xs text-gray-500">{food.calories} kcal</p>
                </div>
              ))}
              {!customFoods.length && (
                <p className="text-xs text-gray-400">{isEn ? 'No custom foods yet.' : 'Chưa có món cá nhân.'}</p>
              )}
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 space-y-3">
              <p className="font-black text-gray-900">Data Strategy</p>
              <p className="text-xs text-gray-500">
                {isEn ? 'Bootstrap 200+ popular foods to enrich initial data.' : 'Khởi tạo 200+ món phổ biến để nâng cấp dữ liệu ban đầu.'}
              </p>
              <button
                onClick={handleBootstrapPopularFoods}
                disabled={bootstrapping}
                className="w-full rounded-xl bg-gray-900 text-white text-sm font-bold py-2 hover:bg-black disabled:opacity-60"
              >
                {bootstrapping ? (isEn ? 'Bootstrapping...' : 'Đang bootstrap...') : (isEn ? 'Bootstrap popular foods' : 'Bootstrap món phổ biến')}
              </button>
            </div>
          )}
        </div>

        <div className="xl:col-span-3">
          {loading ? (
            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-16 flex items-center justify-center">
              <Loader2 size={36} className="animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {foods.map((food) => (
                  <Link
                    key={food.id}
                    to={`/foods/${food.id}${location.search}`}
                    state={{ from: `${location.pathname}${location.search}` }}
                    className="group bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <div className="h-48 bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center overflow-hidden">
                      {food.imageUrl ? (
                        <img src={getAssetUrl(food.imageUrl)} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <span className="text-6xl font-black text-emerald-200">{food.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-500">{food.category}</p>
                          <h2 className="text-xl font-black text-gray-900 mt-1">{food.name}</h2>
                        </div>
                        {food.recipe && (
                          <span className="shrink-0 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-bold">
                            {isEn ? 'Has recipe' : 'Có công thức'}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="rounded-2xl bg-gray-50 p-3">
                          <p className="text-[11px] text-gray-400 font-bold uppercase">Calo</p>
                          <p className="font-black text-gray-900 mt-1">{food.calories}</p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-3">
                          <p className="text-[11px] text-emerald-600 font-bold uppercase">P</p>
                          <p className="font-black text-emerald-700 mt-1">{Math.round(food.protein)}</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-3">
                          <p className="text-[11px] text-amber-600 font-bold uppercase">C</p>
                          <p className="font-black text-amber-700 mt-1">{Math.round(food.carbs)}</p>
                        </div>
                        <div className="rounded-2xl bg-blue-50 p-3">
                          <p className="text-[11px] text-blue-600 font-bold uppercase">F</p>
                          <p className="font-black text-blue-700 mt-1">{Math.round(food.fat)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm font-bold text-gray-900">
                        <span className="flex items-center gap-2 text-amber-600">
                          <Flame size={16} />
                          {isEn ? `${food.popularity} interests` : `${food.popularity} lượt quan tâm`}
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          {isEn ? 'View details' : 'Xem chi tiết'} <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-700 disabled:opacity-40"
                >
                  {isEn ? 'Previous' : 'Trước'}
                </button>
                <span className="text-sm font-bold text-gray-500">
                  {isEn ? `Page ${page} / ${totalPages}` : `Trang ${page} / ${totalPages}`}
                </span>
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-2xl bg-white border border-gray-100 text-sm font-bold text-gray-700 disabled:opacity-40"
                >
                  {isEn ? 'Next' : 'Sau'}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default FoodsPage;
