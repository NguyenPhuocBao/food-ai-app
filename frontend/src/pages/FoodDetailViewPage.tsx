import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, Flame, Heart, Loader2, MessageCircle, Plus, SendHorizontal, Star, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getFoodById } from '../services/food.service';
import { addFavoriteFood, removeFavoriteFood } from '../services/favorite.service';
import { addMeal } from '../services/meal.service';
import { getAssetUrl } from '../services/api';
import { markRecipeAsCooked, saveRecipe, unsaveRecipe } from '../services/recipe.service';
import { addReview, addReviewReply } from '../services/review.service';
import type { FoodDetail } from '../types';

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: 'Bữa sáng' },
  { value: 'LUNCH', label: 'Bữa trưa' },
  { value: 'DINNER', label: 'Bữa tối' },
  { value: 'SNACK', label: 'Bữa phụ' },
];

const FoodDetailViewPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const from = (location.state as { from?: string } | null)?.from;
  const backTo =
    typeof from === 'string' && from.startsWith('/foods')
      ? from
      : location.search
        ? `/foods${location.search}`
        : null;
  const [food, setFood] = useState<FoodDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [mealType, setMealType] = useState('DINNER');
  const [quantity, setQuantity] = useState(1);
  const [submittingMeal, setSubmittingMeal] = useState(false);
  const [markingCooked, setMarkingCooked] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [togglingRecipeSave, setTogglingRecipeSave] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);

  const fetchFood = async (showLoading = true) => {
    if (!id) return;
    if (showLoading) setLoading(true);

    try {
      const data = await getFoodById(Number(id));
      setFood(data);
    } catch {
      toast.error('Không thể tải chi tiết món ăn');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFood();
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

  const handleSubmitReview = async () => {
    if (!food) return;
    if (!user) {
      toast.error('Bạn cần đăng nhập để đánh giá');
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Điểm đánh giá phải từ 1 - 5');
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview(food.id, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewComment('');
      await fetchFood(false);
      toast.success('Đã gửi đánh giá');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitReply = async (reviewId: number) => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để phản hồi');
      return;
    }

    const content = (replyInputs[reviewId] || '').trim();
    if (!content) {
      toast.error('Nhập nội dung phản hồi');
      return;
    }

    setReplyingReviewId(reviewId);
    try {
      const reply = await addReviewReply(reviewId, content);
      setFood((current) => {
        if (!current?.reviews) return current;
        return {
          ...current,
          reviews: current.reviews.map((review) =>
            review.id === reviewId
              ? { ...review, replies: [...(review.replies || []), reply] }
              : review
          ),
        };
      });
      setReplyInputs((prev) => ({ ...prev, [reviewId]: '' }));
      toast.success('Đã gửi phản hồi');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Không thể gửi phản hồi');
    } finally {
      setReplyingReviewId(null);
    }
  };

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    navigate(-1);
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
        <Link to={backTo || '/foods'} className="inline-flex mt-4 px-4 py-2 rounded-2xl bg-gray-900 text-white font-bold">
          Quay lại thư viện
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">
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
            <p className="text-sm text-gray-500 mt-3">{food.favorites?.length || 0} người đã lưu món ăn này vào thư viện.</p>

            <div className="mt-5 border-t border-gray-100 pt-5 space-y-3">
              <p className="text-sm font-black text-gray-900">Viết đánh giá của bạn</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const score = index + 1;
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setReviewRating(score)}
                      className="p-1"
                    >
                      <Star
                        size={18}
                        className={score <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                      />
                    </button>
                  );
                })}
              </div>
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                rows={3}
                placeholder="Cảm nhận của bạn về món ăn..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm bg-white text-gray-900 placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="w-full rounded-2xl bg-gray-900 text-white py-3 text-sm font-black disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submittingReview ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
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
          <p className="text-gray-500 mt-3">Bạn vẫn có thềEthêm món vào nhật ký hoặc thử một món khác trong thư viện công thức.</p>
          <Link to="/recipes" className="inline-flex mt-6 rounded-2xl bg-gray-900 text-white font-bold px-5 py-3">
            Xem thư viện công thức
          </Link>
        </section>
      )}

      <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-7">
        <h2 className="text-2xl font-black text-gray-900">Đánh giá và thảo luận</h2>
        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
          <p className="text-sm font-black text-gray-900">Tạo bình luận mới</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const score = index + 1;
              return (
                <button
                  key={`composer-${score}`}
                  type="button"
                  onClick={() => setReviewRating(score)}
                  className="p-1"
                >
                  <Star
                    size={18}
                    className={score <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                  />
                </button>
              );
            })}
          </div>
          <textarea
            value={reviewComment}
            onChange={(event) => setReviewComment(event.target.value)}
            rows={3}
            placeholder="Chia sẻ cảm nhận của bạn về món ăn này..."
            className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={submittingReview}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white text-sm font-bold px-4 py-2.5 disabled:opacity-60"
          >
            {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <SendHorizontal size={14} />}
            {submittingReview ? 'Đang gửi...' : 'Đăng bình luận'}
          </button>
        </div>
        {!food.reviews?.length ? (
          <p className="text-sm text-gray-500 mt-4">Chưa có đánh giá nào, Hãy là người đầu tiên chia sẽ cảm nhận.</p>
        ) : (
          <div className="space-y-4 mt-6">
            {food.reviews.map((review) => (
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
                <p className="text-sm text-gray-700 mt-4 leading-relaxed">{review.comment || 'Người dùng chưa để lại nhận xét chi tiết.'}</p>

                <div className="mt-4 space-y-2">
                  {(review.replies || []).map((reply) => (
                    <div key={reply.id} className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black text-gray-700">
                          {reply.user.name}
                          {reply.user.role === 'ADMIN' && <span className="ml-2 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px]">ADMIN</span>}
                        </p>
                        <p className="text-[11px] text-gray-400">{new Date(reply.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                    </div>
                  ))}
                </div>

                {user && (
                  <div className="mt-4 flex items-start gap-2">
                    <MessageCircle size={16} className="mt-2 text-gray-400" />
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={replyInputs[review.id] || ''}
                        onChange={(event) => setReplyInputs((prev) => ({ ...prev, [review.id]: event.target.value }))}
                        rows={2}
                        placeholder="Trả lời đánh giá này..."
                        className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitReply(review.id)}
                        disabled={replyingReviewId === review.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white text-xs font-bold px-3 py-2 disabled:opacity-60"
                      >
                        {replyingReviewId === review.id ? <Loader2 size={14} className="animate-spin" /> : <SendHorizontal size={14} />}
                        {replyingReviewId === review.id ? 'Đang gửi' : 'Gửi phản hồi'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FoodDetailViewPage;


