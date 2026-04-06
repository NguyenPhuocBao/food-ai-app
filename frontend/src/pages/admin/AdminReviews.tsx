import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Star, Trash, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reviews?page=${page}&limit=20&rating=${ratingFilter}`);
      setReviews(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) { toast.error('Lỗi tải đánh giá'); } finally { setLoading(false); }
  };
  useEffect(() => { loadReviews(); }, [page, ratingFilter]);

  const handleDelete = async (id: number) => { if (confirm('Xóa đánh giá này?')) { await api.delete(`/admin/reviews/${id}`); toast.success('Đã xóa'); loadReviews(); } };

  if (loading && page===1) {
    return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div>;
  }

  if (!loading && reviews.length === 0) {
    return <EmptyState icon={Star} title="Không có đánh giá" description="Chưa có đánh giá nào từ người dùng." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Quản lý đánh giá</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kiểm duyệt và quản lý đánh giá người dùng</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800">
            <option value="">Tất cả sao</option><option value="1">1 sao</option><option value="2">2 sao</option><option value="3">3 sao</option><option value="4">4 sao</option><option value="5">5 sao</option>
          </select>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/60 text-xs font-semibold uppercase tracking-widest">
              <tr><th className="px-6 py-4 text-left">ID</th><th className="px-6 py-4 text-left">Người dùng</th><th className="px-6 py-4 text-left">Món ăn</th><th className="px-6 py-4 text-left">Đánh giá</th><th className="px-6 py-4 text-left">Bình luận</th><th className="px-6 py-4 text-left">Ngày</th><th className="px-6 py-4 text-left">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {reviews.map((review) => (
                <tr key={review.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{review.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{review.user?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{review.food?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-0.5">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                      {[...Array(5-review.rating)].map((_, i) => <Star key={i} size={16} className="text-gray-300" />)}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-gray-500 dark:text-gray-400">{review.comment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(review.id)} className="text-red-600 hover:text-red-800" title="Xóa"><Trash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">← Trước</button>
        <span className="text-gray-600 dark:text-gray-400">Trang {page} / {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition">Sau →</button>
      </div>
    </div>
  );
};

export default AdminReviews;