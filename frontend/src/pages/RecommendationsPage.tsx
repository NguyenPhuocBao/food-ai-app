import { useEffect, useState } from 'react';
import { Check, Loader2, RefreshCcw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Recommendation } from '../types';
import {
  generateRecommendations,
  getRecommendations,
  markRecommendationViewed,
  respondRecommendation,
} from '../services/recommendation.service';
import { getAssetUrl } from '../services/api';

const STATUS_TABS: Array<{ label: string; value: 'all' | 'new' | 'accepted' | 'rejected' }> = [
  { label: 'Tat ca', value: 'all' },
  { label: 'Moi', value: 'new' },
  { label: 'Da chon', value: 'accepted' },
  { label: 'Da bo qua', value: 'rejected' },
];

const RecommendationsPage = () => {
  const [status, setStatus] = useState<'all' | 'new' | 'accepted' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [items, setItems] = useState<Recommendation[]>([]);

  const loadData = async (nextStatus = status) => {
    setLoading(true);
    try {
      const data = await getRecommendations(nextStatus);
      setItems(data);
    } catch {
      toast.error('Khong th? tai gui ?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(status);
  }, [status]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRecommendations(10);
      toast.success('Da tao gui ? moi');
      await loadData(status);
    } catch {
      toast.error('Khong tao duoc gui ?');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewed = async (item: Recommendation) => {
    if (item.isViewed) return;
    setItems((prev) => prev.map((entry) => (
      entry.id === item.id ? { ...entry, isViewed: true } : entry
    )));
    try {
      await markRecommendationViewed(item.id);
    } catch {
      // keep optimistic state
    }
  };

  const handleRespond = async (id: number, accepted: boolean) => {
    setItems((prev) => prev.map((entry) => (
      entry.id === id ? { ...entry, isAccepted: accepted, isViewed: true } : entry
    )));

    try {
      await respondRecommendation(id, accepted);
      toast.success(accepted ? 'Da chap nhan gui ?' : 'Da bo qua gui ?');
    } catch {
      toast.error('Khong cap nhat duoc trang thai');
      await loadData(status);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[28px] bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">Recommendations</p>
            <h1 className="mt-2 text-3xl font-black">Gui ? mon an theo muc tieu cua ban</h1>
            <p className="mt-2 text-sm text-emerald-100">Du lieu duoc tao tu lich su An uong, muc tieu va so thich hien tai.</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Tao gui ? moi
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              status === tab.value
                ? 'bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => loadData(status)}
          className="ml-auto inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCcw size={14} />
          Tai loi
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-3xl bg-gray-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-semibold text-gray-800 dark:text-slate-200">Chua co gui ? nao</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Nhan "Tao gui ? moi" de he thong gui ? mon an tu bang recommendations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const imageUrl = getAssetUrl(item.food.imageUrl);

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="h-44 bg-gray-100 dark:bg-slate-800">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.food.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl font-black text-gray-300 dark:text-slate-600">
                      {item.food.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <Link
                      to={`/foods/${item.food.id}`}
                      onClick={() => handleViewed(item)}
                      className="text-lg font-black text-gray-900 hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400"
                    >
                      {item.food.name}
                    </Link>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{item.food.category}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-amber-50 px-2 py-2 font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                      {item.food.calories}kcal
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-2 py-2 font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                      {Math.round(item.food.protein)}P
                    </div>
                    <div className="rounded-xl bg-sky-50 px-2 py-2 font-bold text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">
                      {Math.round(item.food.fat)}F
                    </div>
                    <div className="rounded-xl bg-purple-50 px-2 py-2 font-bold text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                      {Math.round(item.food.carbs)}C
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                    Ly do: <span className="font-semibold">{item.reason}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 dark:text-slate-500">Score {item.score.toFixed(1)}</span>
                    {item.isAccepted === true ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Check size={12} /> ?? chon
                      </span>
                    ) : item.isAccepted === false ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                        ?? bo qua
                      </span>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2 py-1 font-semibold ${item.isViewed ? 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {item.isViewed ? 'Da xem' : 'Moi'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRespond(item.id, true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                    >
                      <ThumbsUp size={14} />
                      Chon
                    </button>
                    <button
                      onClick={() => handleRespond(item.id, false)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <ThumbsDown size={14} />
                      Bo qua
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;

