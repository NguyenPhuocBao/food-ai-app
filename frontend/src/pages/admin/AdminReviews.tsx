import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Star, Trash, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/admin/EmptyState';

const AdminReviews = () => {
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
      const res = await api.get(`/admin/reviews?page=${page}&limit=20&rating=${ratingFilter}`);
      setReviews(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (error) { toast.error('Lỗi tải đánh giá'); } finally { setLoading(false); }
  };
  useEffect(() => { loadReviews(); }, [page, ratingFilter]);

  const handleDelete = async (id: number) => {
    if (confirm('Xóa đánh giá này?')) {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Đã xóa');
      loadReviews();
    }
  };

  const openNotifyModal = (review: any) => {
    setSelectedReview(review);
    setNotifyTitle(`Phản hồi đánh giá của bạn cho món ${review.food?.name}`);
    setNotifyMessage('Cảm ơn bạn đã đánh giá! Chúng tôi rất trân trọng góp ý của bạn.');
    setShowNotifyModal(true);
  };

  const sendNotification = async () => {
    try {
      await api.post(`/admin/notifications/send-to-user/${selectedReview.userId}`, {
        title: notifyTitle,
        message: notifyMessage,
        type: 'INFO',
      });
      toast.success('Đã gửi phản hồi đến người dùng');
      setShowNotifyModal(false);
    } catch (error) { toast.error('Gửi thất bại'); }
  };

  if (loading && page===1) return <div>Loading...</div>;
  if (!loading && reviews.length===0) return <EmptyState icon={Star} title="Không có đánh giá" description="Chưa có đánh giá nào từ người dùng." />;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý đánh giá</h1>
        <p className="text-gray-500">Kiểm duyệt và phản hồi đánh giá người dùng</p>
      </div>
      <div className="flex gap-4">
        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="border rounded-xl px-4 py-2">
          <option value="">Tất cả sao</option><option value="1">1 sao</option><option value="2">2 sao</option>
          <option value="3">3 sao</option><option value="4">4 sao</option><option value="5">5 sao</option>
        </select>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Người dùng</th><th className="px-6 py-3">Món ăn</th><th className="px-6 py-3">Đánh giá</th><th className="px-6 py-3">Bình luận</th><th className="px-6 py-3">Ngày</th><th className="px-6 py-3">Hành động</th></tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{review.id}</td>
                <td className="px-6 py-4">{review.user?.name}</td>
                <td className="px-6 py-4">{review.food?.name}</td>
                <td className="px-6 py-4 flex items-center gap-0.5">{[...Array(5)].map((_,i)=> <Star key={i} size={16} className={i<review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}/>)}</td>
                <td className="px-6 py-4 max-w-xs truncate">{review.comment}</td>
                <td className="px-6 py-4">{new Date(review.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => openNotifyModal(review)} className="text-blue-600" title="Gửi phản hồi"><Bell size={18} /></button>
                  <button onClick={() => handleDelete(review.id)} className="text-red-600"><Trash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between">
        <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 border rounded-xl">Trước</button>
        <span>{page}/{totalPages}</span>
        <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 border rounded-xl">Sau</button>
      </div>

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Gửi phản hồi đến người dùng</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium">Tiêu đề</label>
              <input type="text" value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} className="w-full border rounded-xl px-4 py-2" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Nội dung</label>
              <textarea value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} rows={4} className="w-full border rounded-xl px-4 py-2" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNotifyModal(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Hủy</button>
              <button onClick={sendNotification} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Gửi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;