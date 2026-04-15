import { useEffect, useMemo, useState } from 'react';
import { Bell, Search, Star, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import EmptyState from '../../components/admin/EmptyState';
import { formatAdminDate } from '../../utils/adminDateTime';

function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const normalize = (value: string) => removeAccents(String(value || '').toLowerCase());

const AdminReviewsV2 = () => {
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');

  const itemsPerPage = 20;

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/reviews?limit=1000');
      const reviews = (response.data.data || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setAllReviews(reviews);
    } catch {
      toast.error('Khong the tai danh sach danh gia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const keyword = normalize(searchInput.trim());

    return allReviews.filter((review) => {
      if (ratingFilter && String(review.rating) !== ratingFilter) return false;
      if (!keyword) return true;

      const idText = String(review.id || '');
      const userName = normalize(review.user?.name || '');
      const userEmail = normalize(review.user?.email || '');
      const foodName = normalize(review.food?.name || '');
      const comment = normalize(review.comment || '');

      return (
        idText.includes(keyword) ||
        userName.includes(keyword) ||
        userEmail.includes(keyword) ||
        foodName.includes(keyword) ||
        comment.includes(keyword)
      );
    });
  }, [allReviews, ratingFilter, searchInput]);

  useEffect(() => {
    setPage(1);
  }, [ratingFilter, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
  const paginatedReviews = filteredReviews.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDelete = async (reviewId: number) => {
    const confirmed = window.confirm('Xoa danh gia nay?');
    if (!confirmed) return;

    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      setAllReviews((prev) => prev.filter((review) => review.id !== reviewId));
      toast.success('Da xoa danh gia');
    } catch {
      toast.error('Xoa danh gia that bai');
    }
  };

  const openNotifyModal = (review: any) => {
    setSelectedReview(review);
    setNotifyTitle(`Phan hoi danh gia cho mon ${review.food?.name || ''}`);
    setNotifyMessage('Cam on ban da gui danh gia. Chung toi da ghi nhan va se tiep tuc cai tien.');
    setShowNotifyModal(true);
  };

  const sendNotification = async () => {
    if (!selectedReview) return;

    try {
      await api.post(`/admin/notifications/send-to-user/${selectedReview.userId}`, {
        title: notifyTitle,
        message: notifyMessage,
        type: 'INFO',
      });
      toast.success('Da gui phan hoi den nguoi dung');
      setShowNotifyModal(false);
    } catch {
      toast.error('Gui phan hoi that bai');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-12 w-64 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-12 w-44 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  if (allReviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Khong co danh gia"
        description="He thong chua co du lieu danh gia."
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Quan ly danh gia</h1>
        <p className="text-gray-500 dark:text-slate-400">Kiem duyet danh gia va gui phan hoi den nguoi dung</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select
          value={ratingFilter}
          onChange={(event) => setRatingFilter(event.target.value)}
          className="border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
        >
          <option value="">Tat ca sao</option>
          <option value="1">1 sao</option>
          <option value="2">2 sao</option>
          <option value="3">3 sao</option>
          <option value="4">4 sao</option>
          <option value="5">5 sao</option>
        </select>

        <div className="relative flex-1 min-w-[260px] max-w-xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tim theo nguoi dung, mon an, comment..."
            className="w-full border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-slate-800/70 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Nguoi dung</th>
                <th className="px-6 py-3 text-left">Mon an</th>
                <th className="px-6 py-3 text-left">So sao</th>
                <th className="px-6 py-3 text-left">Binh luan</th>
                <th className="px-6 py-3 text-left">Ngay tao</th>
                <th className="px-6 py-3 text-left">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-slate-400">
                    Khong co du lieu
                  </td>
                </tr>
              ) : (
                paginatedReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-200">{review.id}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-200">{review.user?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-slate-200">{review.food?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={16}
                            className={index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-slate-600'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm truncate text-gray-700 dark:text-slate-200">{review.comment || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{formatAdminDate(review.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openNotifyModal(review)}
                          className="text-blue-600 dark:text-blue-400"
                          title="Gui phan hoi"
                        >
                          <Bell size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 dark:text-red-400"
                          title="Xoa danh gia"
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
        <div className="flex justify-between items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 disabled:opacity-50"
          >
            Truoc
          </button>
          <span className="text-gray-600 dark:text-slate-400">
            Trang {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">Gui phan hoi danh gia</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tieu de</label>
                <input
                  type="text"
                  value={notifyTitle}
                  onChange={(event) => setNotifyTitle(event.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Noi dung</label>
                <textarea
                  value={notifyMessage}
                  onChange={(event) => setNotifyMessage(event.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowNotifyModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl"
              >
                Huy
              </button>
              <button
                onClick={sendNotification}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Gui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsV2;
