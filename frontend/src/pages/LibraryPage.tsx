import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, BookOpen, Clock3, Heart, Loader2, Sparkles } from 'lucide-react';
import { getAssetUrl } from '../services/api';
import { getFavoriteFoods } from '../services/favorite.service';
import { getSavedRecipes } from '../services/recipe.service';
import type { FoodItem } from '../types';

type LibraryTab = 'favorites' | 'recipes';

const formatSavedDate = (value?: string) => {
  if (!value) return 'Moi luu gan day';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('favorites');
  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLibrary = async () => {
      setLoading(true);

      try {
        const [favorites, recipes] = await Promise.all([
          getFavoriteFoods().catch(() => []),
          getSavedRecipes().catch(() => []),
        ]);

        setFavoriteFoods(favorites);
        setSavedRecipes(recipes.filter((item) => item.recipe));
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, []);

  const currentItems = activeTab === 'favorites' ? favoriteFoods : savedRecipes;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <section className="rounded-[32px] overflow-hidden border border-rose-100 bg-[radial-gradient(circle_at_top_right,_rgba(251,113,133,0.24),_transparent_32%),linear-gradient(135deg,_#fff7ed,_#ffffff_40%,_#fdf2f8)] shadow-sm">
        <div className="px-8 py-10 md:px-10 md:py-12 flex flex-col lg:flex-row gap-8 justify-between">
          <div className="max-w-2xl">
            <p className="text-rose-500 font-bold text-sm tracking-[0.2em] uppercase mb-4">Thu vien ca nhan</p>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
              Mon an yeu thich va cong thuc da luu cua ban
            </h1>
            <p className="text-gray-600 mt-4 max-w-xl leading-relaxed">
              Tap hop nhung mon an ban danh dau de quay lai nhanh, theo doi cong thuc da luu va tiep tuc len ke
              hoach bua an tu thu vien rieng.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 min-w-[280px]">
            <div className="rounded-[24px] bg-white/80 border border-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Mon yeu thich</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{favoriteFoods.length}</p>
            </div>
            <div className="rounded-[24px] bg-white/80 border border-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Cong thuc da luu</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{savedRecipes.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="inline-flex gap-2 rounded-2xl bg-white border border-gray-100 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'favorites' ? 'bg-rose-500 text-white' : 'text-gray-500'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Heart size={16} />
              Mon yeu thich
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'recipes' ? 'bg-gray-900 text-white' : 'text-gray-500'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Bookmark size={16} />
              Cong thuc da luu
            </span>
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/foods"
            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-gray-100 px-4 py-3 text-sm font-bold text-gray-700 shadow-sm"
          >
            Kham pha mon an <ArrowRight size={16} />
          </Link>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm font-bold text-amber-700 shadow-sm"
          >
            Xem thu vien cong thuc <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-16 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-rose-500" />
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Sparkles size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mt-5">
            {activeTab === 'favorites' ? 'Ban chua luu mon an nao' : 'Ban chua luu cong thuc nao'}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto leading-relaxed">
            {activeTab === 'favorites'
              ? 'Bat dau danh dau cac mon an ban muon quay lai sau. Thu vien nay se giup ban chon mon nhanh hon cho nhat ky va meal plan.'
              : 'Luu cac cong thuc ban muon nau de quay lai nhanh khi can len bua an hoac them vao lich trinh trong tuan.'}
          </p>
          <Link
            to={activeTab === 'favorites' ? '/foods' : '/recipes'}
            className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 text-white px-5 py-3 mt-6 text-sm font-bold"
          >
            {activeTab === 'favorites' ? 'Mo thu vien mon an' : 'Mo trang cong thuc'}
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : activeTab === 'favorites' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favoriteFoods.map((food) => (
            <Link
              key={food.id}
              to={`/foods/${food.id}`}
              className="group bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="h-52 bg-gradient-to-br from-rose-50 via-white to-amber-50 overflow-hidden flex items-center justify-center">
                {food.imageUrl ? (
                  <img
                    src={getAssetUrl(food.imageUrl)}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-6xl font-black text-rose-200">{food.name.charAt(0)}</span>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-500">{food.category}</p>
                    <h2 className="text-xl font-black text-gray-900 mt-1">{food.name}</h2>
                  </div>
                  {food.recipe && (
                    <span className="shrink-0 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-bold">
                      Co cong thuc
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-400 font-bold uppercase">Kcal</p>
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

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-medium">Da luu {formatSavedDate(food.savedAt)}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                    Xem chi tiet <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {savedRecipes.map((food) => (
            <Link
              key={food.id}
              to={`/foods/${food.id}`}
              className="group bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-48 h-52 md:h-auto bg-gradient-to-br from-amber-50 via-white to-rose-50 overflow-hidden flex items-center justify-center shrink-0">
                  {food.imageUrl ? (
                    <img
                      src={getAssetUrl(food.imageUrl)}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <BookOpen size={42} className="text-amber-300" />
                  )}
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-bold">
                        {food.recipe?.difficulty || 'RECIPE'}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">Luu ngay {formatSavedDate(food.savedAt)}</span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mt-4">
                      {food.recipe?.title || food.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3">
                      {food.recipe?.summary || food.description || 'Mo chi tiet de xem nguyen lieu, cac buoc nau va dinh duong cua mon an nay.'}
                    </p>

                    <div className="grid grid-cols-3 gap-3 mt-5 text-sm">
                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-[11px] text-gray-400 font-bold uppercase">Thoi gian</p>
                        <p className="font-black text-gray-900 mt-1 inline-flex items-center gap-1">
                          <Clock3 size={14} /> {food.recipe?.totalTime || 0}p
                        </p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <p className="text-[11px] text-emerald-600 font-bold uppercase">Khau phan</p>
                        <p className="font-black text-emerald-700 mt-1">{food.recipe?.servings || 1}</p>
                      </div>
                      <div className="rounded-2xl bg-rose-50 p-3">
                        <p className="text-[11px] text-rose-600 font-bold uppercase">Calories</p>
                        <p className="font-black text-rose-700 mt-1">{food.calories}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 text-sm">
                    <span className="text-gray-400 font-medium">{food.name}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                      Mo cong thuc <ArrowRight size={16} />
                    </span>
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

export default LibraryPage;
