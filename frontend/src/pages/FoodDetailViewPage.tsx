import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, Flame, Heart, Loader2, Plus, Star, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getFoodById } from '../services/food.service';
import { addFavoriteFood, removeFavoriteFood } from '../services/favorite.service';
import { addMeal } from '../services/meal.service';
import { getAssetUrl } from '../services/api';
import { markRecipeAsCooked, saveRecipe, unsaveRecipe } from '../services/recipe.service';
import type { FoodDetail } from '../types';

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Bữa sáng' },
  { value: 'LUNCH', label: 'Bữa trưa' },
  { value: 'DINNER', label: 'Bữa tối' },
  { value: 'SNACK', label: 'Bữa phụ' },
];

const FoodDetailViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [food, setFood] = useState<FoodDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealType, setMealType] = useState('DINNER');
  const [quantity, setQuantity] = useState(1);
  const [submittingMeal, setSubmittingMeal] = useState(false);
  const [markingCooked, setMarkingCooked] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [togglingRecipeSave, setTogglingRecipeSave] = useState(false);

  useEffect(() => {
    const fetchFood = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await getFoodById(Number(id));
        setFood(data);
      } catch {
        toast.error('Không thể tải chi tiết món ăn');
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id]);

  const isFavorite = !!user && !!food?.favorites?.some((favorite) => favorite.userId === user.id);
  const ratingAverage = food?.reviews?.length
    ? food.reviews.reduce((sum, review) => sum + review.rating, 0) / food.reviews.length
    : 0;

  const syncFavoriteState = (nextFavorite: boolean) => {
    if (!food || !user) return;

    setFood({
      ...food,
      favorites: nextFavorite
        ? [...(food.favorites || []), { id: Date.now(), userId: user.id, foodId: food.id }]
        : (food.favorites || []).filter((favorite) => favorite.userId !== user.id),
    });
  };

  const handleToggleFavorite = async () => {
    if (!food || !user) return;

    setTogglingFavorite(true);
    try {
      if (isFavorite) {
        await removeFavoriteFood(food.id);
        syncFavoriteState(false);
        toast.success('Đã bỏ khỏi yêu thích');
      } else {
        await addFavoriteFood(food.id);
        syncFavoriteState(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch {
      toast.error('Không thể cập nhật yêu thích');
    } finally {
      setTogglingFavorite(false);
    }
  };

  const handleToggleRecipeSave = async () => {
    if (!food?.recipe) return;

    setTogglingRecipeSave(true);
    try {
      if (isFavorite) {
        await unsaveRecipe(food.recipe.id);
        syncFavoriteState(false);
        toast.success('Đã bỏ lưu công thức');
      } else {
        await saveRecipe(food.recipe.id);
        syncFavoriteState(true);
        toast.success('Đã lưu công thức');
      }
    } catch {
      toast.error('Không thể lưu công thức');
    } finally {
      setTogglingRecipeSave(false);
    }
  };

  const handleAddMeal = async () => {
    if (!food) return;

    setSubmittingMeal(true);
    try {
      await addMeal(food.id, mealType, quantity);
      toast.success('Đã thêm món ăn vào nhật ký');
      navigate('/diary');
    } catch {
      toast.error('Không thể thêm món ăn');
    } finally {
      setSubmittingMeal(false);
    }
  };

  const handleCookRecipe = async () => {
    if (!food?.recipe) return;

    setMarkingCooked(true);
    try {
      await markRecipeAsCooked(food.recipe.id);
      toast.success('Đã ghi nhận bạn đã nấu món này');
    } catch {
      toast.error('Không thể ghi nhận công thức');
    } finally {
      setMarkingCooked(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!food) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-lg font-bold text-gray-900">Không tìm thấy món ăn.</p>
        <Link to="/foods" className="inline-flex mt-4 px-4 py-2 rounded-2xl bg-gray-900 text-white font-bold">
          Quay lại thư viện
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 rounded-[32px] overflow-hidden bg-white border border-gray-100 shadow-sm">
          <div className="h-[320px] bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center overflow-hidden">
            {food.imageUrl ? (
              <img src={getAssetUrl(food.imageUrl)} alt={food.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl font-black text-emerald-200">{food.name.charAt(0)}</span>
            )}
          </div>

          <div className="p-7">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold">{food.category}</span>
              {food.isVegetarian && <span className="rounded-full bg-lime-50 text-lime-700 px-3 py-1 text-xs font-bold">Ăn chay</span>}
              {food.isVegan && <span className="rounded-full bg-green-50 text-green-700 px-3 py-1 text-xs font-bold">Thuần chay</span>}
              {food.isGlutenFree && <span className="rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-xs font-bold">Không gluten</span>}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900">{food.name}</h1>
            <p className="text-gray-600 mt-4 leading-relaxed">
              {food.description || 'Xem nhanh dinh dưỡng, công thức và thêm món ăn này vào kế hoạch hoặc nhật ký hằng ngày.'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="rounded-[24px] bg-gray-50 p-4">
                <p className="text-xs text-gray-400 font-bold uppercase">Calories</p>
                <p className="text-2xl font-black text-gray-900 mt-2">{food.calories}</p>
              </div>
              <div className="rounded-[24px] bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600 font-bold uppercase">Protein</p>
                <p className="text-2xl font-black text-emerald-700 mt-2">{Math.round(food.protein)}g</p>
              </div>
              <div className="rounded-[24px] bg-amber-50 p-4">
                <p className="text-xs text-amber-600 font-bold uppercase">Carbs</p>
                <p className="text-2xl font-black text-amber-700 mt-2">{Math.round(food.carbs)}g</p>
              </div>
              <div className="rounded-[24px] bg-blue-50 p-4">
                <p className="text-xs text-blue-600 font-bold uppercase">Fat</p>
                <p className="text-2xl font-black text-blue-700 mt-2">{Math.round(food.fat)}g</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handleToggleFavorite}
                disabled={togglingFavorite}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-bold transition-colors ${
                  isFavorite ? 'bg-red-50 text-red-600' : 'bg-gray-900 text-white'
                } disabled:opacity-60`}
              >
                <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
                {togglingFavorite ? 'Đang lưu...' : isFavorite ? 'Đã yêu thích' : 'Lưu món ăn'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[32px] bg-gray-900 text-white p-7 shadow-xl">
            <p className="text-sm text-gray-300 font-bold uppercase tracking-[0.2em]">Thêm vào nhật ký</p>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <label className="text-sm font-bold text-gray-300">
                Bữa ăn
                <select value={mealType} onChange={(event) => setMealType(event.target.value)} className="mt-2 w-full rounded-2xl bg-gray-800 border border-gray-700 px-4 py-3 text-white">
                  {MEAL_TYPES.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold text-gray-300">
                Khẩu phần
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl bg-gray-800 border border-gray-700 px-4 py-3 text-white"
                />
              </label>
            </div>
            <button
              onClick={handleAddMeal}
              disabled={submittingMeal}
              className="mt-5 w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submittingMeal ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Thêm vào nhật ký
            </button>
          </div>

          <div className="rounded-[32px] bg-white border border-gray-100 shadow-sm p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Đánh giá cộng đồng</h2>
              <span className="text-sm font-bold text-gray-500">{food.reviews?.length || 0} đánh giá</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={18} className={index < Math.round(ratingAverage) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
              ))}
              <span className="font-black text-gray-900">{ratingAverage.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-3">{food.favorites?.length || 0} người dùng đã lưu món này trong thư viện yêu thích.</p>
          </div>

          {food.recipe && (
            <div className="rounded-[32px] bg-white border border-gray-100 shadow-sm p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-500">Công thức</p>
                  <h2 className="text-2xl font-black text-gray-900 mt-2">{food.recipe.title}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleToggleRecipeSave}
                    disabled={togglingRecipeSave}
                    className={`shrink-0 rounded-2xl px-4 py-3 font-bold disabled:opacity-60 ${
                      isFavorite ? 'bg-red-50 text-red-600' : 'bg-gray-900 text-white'
                    }`}
                  >
                    {togglingRecipeSave ? 'Đang lưu...' : isFavorite ? 'Đã lưu' : 'Lưu CT'}
                  </button>
                  <button
                    onClick={handleCookRecipe}
                    disabled={markingCooked}
                    className="shrink-0 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-3 disabled:opacity-60"
                  >
                    {markingCooked ? 'Đang lưu...' : 'Đã nấu'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2 font-bold text-gray-700">
                  <Clock3 size={15} />
                  {food.recipe.totalTime} phút
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2 font-bold text-gray-700">
                  <Users size={15} />
                  {food.recipe.servings} khẩu phần
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2 font-bold text-gray-700">
                  <Flame size={15} />
                  {food.recipe.difficulty}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {food.recipe ? (
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-4 bg-white rounded-[32px] border border-gray-100 shadow-sm p-7">
            <h2 className="text-xl font-black text-gray-900 mb-4">Nguyên liệu</h2>
            <div className="space-y-3">
              {food.recipe.ingredients?.map((ingredient) => (
                <div key={ingredient.id} className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="font-bold text-gray-900">{ingredient.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {ingredient.amount} {ingredient.unit}
                    {ingredient.notes ? ` • ${ingredient.notes}` : ''}
                  </p>
                </div>
              ))}
            </div>

            {!!food.recipe.tools?.length && (
              <>
                <h3 className="text-lg font-black text-gray-900 mt-8 mb-3">Dụng cụ</h3>
                <div className="flex flex-wrap gap-2">
                  {food.recipe.tools?.map((tool) => (
                    <span key={tool.id} className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-2 text-sm font-bold">
                      {tool.name}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="xl:col-span-8 bg-white rounded-[32px] border border-gray-100 shadow-sm p-7">
            <h2 className="text-xl font-black text-gray-900 mb-4">Các bước thực hiện</h2>
            <div className="space-y-4">
              {food.recipe.steps?.map((step) => (
                <div key={step.id} className="flex gap-4 rounded-[24px] border border-gray-100 p-5">
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black shrink-0">
                    {step.stepNumber}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 leading-relaxed">{step.description}</p>
                    {(step.timer || step.tips) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {step.timer && (
                          <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-bold">
                            {step.timer} giây
                          </span>
                        )}
                        {step.tips && (
                          <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold">
                            {step.tips}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(food.recipe.tips || food.recipe.nutritionNotes) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {food.recipe.tips && (
                  <div className="rounded-[24px] bg-amber-50 p-5">
                    <p className="font-black text-amber-800">Mẹo nấu</p>
                    <p className="text-sm text-amber-700 mt-2 leading-relaxed">{food.recipe.tips}</p>
                  </div>
                )}
                {food.recipe.nutritionNotes && (
                  <div className="rounded-[24px] bg-emerald-50 p-5">
                    <p className="font-black text-emerald-800">Ghi chú dinh dưỡng</p>
                    <p className="text-sm text-emerald-700 mt-2 leading-relaxed">{food.recipe.nutritionNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-10 text-center">
          <CheckCircle2 size={44} className="mx-auto text-emerald-400 mb-4" />
          <h2 className="text-2xl font-black text-gray-900">Món ăn này chưa có công thức chi tiết</h2>
          <p className="text-gray-500 mt-3">Bạn vẫn có thể thêm món vào nhật ký hoặc thử một món khác trong thư viện công thức.</p>
          <Link to="/recipes" className="inline-flex mt-6 rounded-2xl bg-gray-900 text-white font-bold px-5 py-3">
            Xem thư viện công thức
          </Link>
        </section>
      )}

      {!!food.reviews?.length && (
        <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-7">
          <h2 className="text-2xl font-black text-gray-900">Đánh giá gần đây</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {food.reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="rounded-[24px] border border-gray-100 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-gray-900">{review.user.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={14} className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 leading-relaxed">{review.comment || 'Người dùng chưa để lại nhận xét chi tiết.'}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FoodDetailViewPage;
