import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock3, Loader2, Search, Users } from 'lucide-react';
import { getAssetUrl } from '../services/api';
import { getPopularRecipes, getRecentRecipes, searchRecipes } from '../services/recipe.service';
import { useDebounce } from '../hooks/useDebounce';
import type { Recipe } from '../types';

const RecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'search'>('popular');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        if (debouncedSearch.trim()) {
          setActiveTab('search');
          setRecipes(await searchRecipes(debouncedSearch));
          return;
        }

        if (activeTab === 'recent') {
          setRecipes(await getRecentRecipes(12));
          return;
        }

        setRecipes(await getPopularRecipes(12));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [activeTab, debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <section className="bg-[linear-gradient(135deg,_#fef3c7,_#fff7ed_35%,_#ecfccb)] border border-amber-100 rounded-[32px] p-8 md:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-700 mb-4">Cong thuc</p>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 max-w-3xl leading-tight">
          Gợi ý công thức theo món ăn đã có trong hệ thống
        </h1>
        <p className="text-gray-600 mt-4 max-w-2xl leading-relaxed">
          Xem công thức phổ biến, công thức mới thêm gần đây hoặc tìm nhanh theo tên món, mẹo nấu, thời gian và khẩu phần.
        </p>
      </section>

      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex gap-2 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'popular' && !search ? 'bg-gray-900 text-white' : 'text-gray-500'}`}
          >
            Phổ biến
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'recent' && !search ? 'bg-gray-900 text-white' : 'text-gray-500'}`}
          >
            Mới thêm
          </button>
        </div>

        <div className="relative w-full md:w-[360px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm công thức..."
            className="w-full rounded-2xl border-0 bg-white shadow-sm border border-gray-100 pl-11 pr-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-16 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              to={`/foods/${recipe.foodId}`}
              className="group bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-48 bg-gradient-to-br from-amber-50 via-white to-emerald-50 overflow-hidden flex items-center justify-center">
                {recipe.food?.imageUrl ? (
                  <img src={getAssetUrl(recipe.food.imageUrl)} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <BookOpen size={44} className="text-amber-300" />
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-bold">
                    {recipe.difficulty}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">
                    {recipe.cookCount ?? 0} lượt nấu
                  </span>
                </div>

                <h2 className="text-xl font-black text-gray-900">{recipe.title}</h2>
                <p className="text-sm text-gray-500 mt-2 min-h-[40px] line-clamp-2">
                  {recipe.summary || recipe.food?.name || 'Xem hướng dẫn chi tiết để chế biến món ăn này.'}
                </p>

                <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-400 font-bold uppercase">Thời gian</p>
                    <p className="font-black text-gray-900 mt-1 flex items-center gap-1">
                      <Clock3 size={14} /> {recipe.totalTime}p
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <p className="text-[11px] text-emerald-600 font-bold uppercase">Khẩu phần</p>
                    <p className="font-black text-emerald-700 mt-1 flex items-center gap-1">
                      <Users size={14} /> {recipe.servings}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <p className="text-[11px] text-amber-600 font-bold uppercase">Món</p>
                    <p className="font-black text-amber-700 mt-1 truncate">{recipe.food?.name || recipe.foodId}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
