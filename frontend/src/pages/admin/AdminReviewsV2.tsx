import { useEffect, useState } from 'react';
import { Bell, Star, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import EmptyState from '../../components/admin/EmptyState';
import { formatAdminDate } from '../../utils/adminDateTime';

const AdminReviewsV2 = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/reviews?page=${page}&limit=20&rating=${ratingFilter}`);
      setReviews(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Khong the tai danh sach danh gia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, ratingFilter]);

  const handleDelete = async (reviewId: number) => {
    const confirmed = window.confirm('Xoa danh gia nay?');
    if (!confirmed) return;

    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success('Da xoa danh gia');
      loadReviews();
    } catch (error) {
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
    } catch (error) {
      toast.error('Gui phan hoi that bai');
    }
  };

  if (loading && page === 1) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-12 w-64 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-12 w-44 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Khong co danh gia"
        description="Chua co danh gia nao tu nguoi dung voi bo loc hien tai."
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Quan ly danh gia</h1>
        <p className="text-gray-500 dark:text-slate-400">Kiem duyet danh gia va gui phan hoi den nguoi dung</p>
      </div>

      <div className="flex gap-4">
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
              {reviews.map((review) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
