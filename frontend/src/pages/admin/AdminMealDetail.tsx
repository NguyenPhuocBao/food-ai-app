import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Trash2, User, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getAssetUrl } from '../../services/api';
import { formatAdminDateTime } from '../../utils/adminDateTime';
import { useConfirm } from '../../contexts/ConfirmContext';

const AdminMealDetail = () => {
  const confirm = useConfirm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meal, setMeal] = useState<any>(null);

  useEffect(() => {
    const loadMeal = async () => {
      try {
        const response = await api.get(`/admin/meals/${id}`);
        setMeal(response.data.data);
      } catch {
        toast.error('Khong th? tai chi tiet bua an');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadMeal();
  }, [id]);

  const handleDelete = async () => {
    if (!meal) return;
    const confirmed = await confirm({
      title: 'Xóa bữa ăn',
      message: 'Bạn có chắc muốn xóa bữa ăn này?',
      confirmText: 'Xóa bữa ăn',
      tone: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/admin/meals/${meal.id}`);
      toast.success('Da xoa bua an');
      navigate(-1);
    } catch {
      toast.error('Xoa bua an that bai');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-10 w-48 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-72 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
        >
          <ArrowLeft size={16} />
          Quay lai
        </button>
        <p className="mt-4 text-gray-600 dark:text-slate-300">Khong t?m th?y bua an.</p>
      </div>
    );
  }

  const imageUrl = getAssetUrl(meal.food?.imageUrl);

  return (
    <div className="space-y-6 p-6 text-gray-900 dark:text-slate-100">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
        >
          <ArrowLeft size={16} />
          Quay lai user detail
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <Trash2 size={16} />
          Xoa bua an
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="h-72 w-full bg-gray-100 dark:bg-slate-800">
            {imageUrl ? (
              <img src={imageUrl} alt={meal.food?.name || 'Meal'} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl font-black text-gray-300 dark:text-slate-600">
                {(meal.food?.name || '?').charAt(0)}
              </div>
            )}
          </div>
          <div className="space-y-5 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Mon an</p>
              <h1 className="mt-2 text-3xl font-black">{meal.food?.name || 'Khong ro ten mon'}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{meal.food?.category || 'Chua phan loai'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/20">
                <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300">Calories</p>
                <p className="mt-2 text-xl font-black text-amber-800 dark:text-amber-200">{meal.calories}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">Protein</p>
                <p className="mt-2 text-xl font-black text-emerald-800 dark:text-emerald-200">{Math.round(meal.protein)}g</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-4 dark:bg-sky-900/20">
                <p className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-300">Fat</p>
                <p className="mt-2 text-xl font-black text-sky-800 dark:text-sky-200">{Math.round(meal.fat)}g</p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-900/20">
                <p className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">Carbs</p>
                <p className="mt-2 text-xl font-black text-purple-800 dark:text-purple-200">{Math.round(meal.carbs)}g</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold">Thong tin phien an</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Utensils size={16} className="text-gray-400 dark:text-slate-500" />
                <span className="text-gray-500 dark:text-slate-400">Loai bua:</span>
                <span className="font-semibold">{meal.mealType}</span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarClock size={16} className="text-gray-400 dark:text-slate-500" />
                <span className="text-gray-500 dark:text-slate-400">Thoi gian an:</span>
                <span className="font-semibold">{formatAdminDateTime(meal.eatenAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <User size={16} className="text-gray-400 dark:text-slate-500" />
                <span className="text-gray-500 dark:text-slate-400">Nguoi dung:</span>
                <span className="font-semibold">
                  {meal.user?.name || '-'} ({meal.user?.email || '-'})
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-bold">Chi tiet</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-slate-800">
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">So phan</p>
                <p className="mt-2 text-2xl font-black">{meal.quantity}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 dark:bg-slate-800">
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Nguon AI</p>
                <p className="mt-2 text-base font-bold">{meal.isFromAI ? 'Co' : 'Khong'}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Ghi chu</p>
              <p className="mt-2 text-gray-700 dark:text-slate-300">{meal.notes || 'Khong c? ghi chu.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMealDetail;
