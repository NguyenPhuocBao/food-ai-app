import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUserRole, deleteUser, toggleUserBan, resetUserPassword } from '../../services/admin.service';
import { ArrowLeft, Edit, Trash, Lock, Unlock, Key, Mail, Calendar, Activity, Coffee, BookOpen, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import ConfirmModal from '../../components/admin/ConfirmModal';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(Number(id));
        setUser(data);
        setNewRole(data.role);
      } catch (error) {
        toast.error('Không thể tải chi tiết người dùng');
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleRoleChange = async () => {
    await updateUserRole(Number(id), newRole);
    toast.success('Đã cập nhật vai trò');
    setUser({ ...user, role: newRole });
  };

  const handleBan = async () => {
    await toggleUserBan(Number(id));
    toast.success(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa');
    setUser({ ...user, isActive: !user.isActive });
    setShowBanConfirm(false);
  };

  const handleResetPassword = async () => {
    await resetUserPassword(Number(id));
    toast.success('Mật khẩu đã được đặt lại thành 123456');
    setShowResetConfirm(false);
  };

  const handleDelete = async () => {
    await deleteUser(Number(id));
    toast.success('Đã xóa người dùng');
    navigate('/admin/users');
  };

  if (loading) return <div className="flex justify-center items-center h-64">Đang tải...</div>;
  if (!user) return <div className="text-center py-12">Không tìm thấy người dùng</div>;

  const bmi = user.profile?.height && user.profile?.weight ? (user.profile.weight / ((user.profile.height/100)**2)).toFixed(1) : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/users')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{user.name}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <select value={newRole} onChange={e => setNewRole(e.target.value)} onBlur={handleRoleChange} className="px-4 py-2 border rounded-2xl dark:bg-gray-800">
            <option value="USER">USER</option><option value="MODERATOR">MODERATOR</option><option value="ADMIN">ADMIN</option>
          </select>
          <button onClick={() => setShowBanConfirm(true)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${user.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white transition`}>
            {user.isActive ? <Lock size={18} /> : <Unlock size={18} />} {user.isActive ? 'Khóa' : 'Mở khóa'}
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition">
            <Key size={18} /> Reset Pass
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition">
            <Trash size={18} /> Xóa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: personal info + health */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Mail size={18} className="text-gray-400" /><span>{user.email}</span></div>
              <div className="flex items-center gap-3"><Activity size={18} className="text-gray-400" /><span>Vai trò: <strong>{user.role}</strong></span></div>
              <div className="flex items-center gap-3"><Lock size={18} className="text-gray-400" /><span>Trạng thái: {user.isActive ? '✅ Hoạt động' : '❌ Bị khóa'}</span></div>
              <div className="flex items-center gap-3"><Calendar size={18} className="text-gray-400" /><span>Tham gia: {new Date(user.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Hồ sơ sức khỏe</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Chiều cao</p><p className="font-medium">{user.profile?.height || 'N/A'} cm</p></div>
              <div><p className="text-sm text-gray-500">Cân nặng</p><p className="font-medium">{user.profile?.weight || 'N/A'} kg</p></div>
              <div><p className="text-sm text-gray-500">BMI</p><p className="font-medium">{bmi}</p></div>
              <div><p className="text-sm text-gray-500">Calo mục tiêu</p><p className="font-medium">{user.profile?.targetCalories || 2000}</p></div>
              <div><p className="text-sm text-gray-500">Protein mục tiêu</p><p className="font-medium">{user.profile?.targetProtein || 150} g</p></div>
              <div><p className="text-sm text-gray-500">Fat mục tiêu</p><p className="font-medium">{user.profile?.targetFat || 55} g</p></div>
              <div><p className="text-sm text-gray-500">Carbs mục tiêu</p><p className="font-medium">{user.profile?.targetCarbs || 250} g</p></div>
            </div>
            {user.profile?.allergies?.length > 0 && (
              <div className="mt-4"><p className="text-sm text-gray-500">Dị ứng</p><p className="text-red-600">{user.profile.allergies.join(', ')}</p></div>
            )}
          </div>
        </div>

        {/* Right column: stats, chat, reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 text-center"><Camera size={24} className="mx-auto text-blue-500 mb-2" /><p className="text-2xl font-bold">{user._count?.scanHistory || 0}</p><p className="text-sm">Lượt scan</p></div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 text-center"><Coffee size={24} className="mx-auto text-orange-500 mb-2" /><p className="text-2xl font-bold">{user._count?.meals || 0}</p><p className="text-sm">Bữa ăn</p></div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 text-center"><BookOpen size={24} className="mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{user._count?.favorites || 0}</p><p className="text-sm">Công thức đã lưu</p></div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-4 text-center"><Activity size={24} className="mx-auto text-purple-500 mb-2" /><p className="text-2xl font-bold">--</p><p className="text-sm">Calo TB/ngày</p></div>
          </div>

          {/* Recent chats */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MessageCircle size={20} /> Lịch sử chat gần đây</h2>
            {user.chatSessions?.length === 0 ? <p className="text-gray-500">Chưa có chat nào.</p> : (
              <div className="space-y-3">
                {user.chatSessions?.slice(0,5).map((session: any) => (
                  <div key={session.id} className="border-b pb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-2xl transition" onClick={() => navigate(`/admin/chat-ai?session=${session.id}`)}>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-xs text-gray-400">Cập nhật: {new Date(session.updatedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">⭐ Đánh giá đã viết</h2>
            {user.reviews?.length === 0 ? <p className="text-gray-500">Chưa có đánh giá nào.</p> : (
              <div className="space-y-4">
                {user.reviews?.slice(0,5).map((review: any) => (
                  <div key={review.id} className="border-b pb-3">
                    <div className="flex items-center gap-2"><span className="font-medium">{review.food?.name}</span><div className="flex text-yellow-400">{"⭐".repeat(review.rating)}</div></div>
                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} title="Xóa người dùng" message={`Xóa người dùng ${user.name}?`} />
      <ConfirmModal isOpen={showBanConfirm} onClose={() => setShowBanConfirm(false)} onConfirm={handleBan} title={user.isActive ? "Khóa tài khoản" : "Mở khóa"} message={user.isActive ? `Khóa tài khoản ${user.name}?` : `Mở khóa ${user.name}?`} confirmText={user.isActive ? "Khóa" : "Mở khóa"} />
      <ConfirmModal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} onConfirm={handleResetPassword} title="Reset mật khẩu" message={`Đặt lại mật khẩu cho ${user.name} thành 123456?`} confirmText="Reset" />
    </div>
  );
};

export default AdminUserDetail;