import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trash2, Lock, Unlock, Key, 
  Activity, Camera, Calendar, Heart, Eye, 
  Star, MessageSquare, User, Mail, Shield, CheckCircle, XCircle,
  Ruler, Weight, Target, AlertCircle, TrendingUp, PieChart as PieChartIcon,
  Utensils, Clock, Loader2, X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/admin/ConfirmModal';
import EmptyState from '../../components/admin/EmptyState';
import { formatAdminDate, formatAdminDateTime } from '../../utils/adminDateTime';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [weeklyCalories, setWeeklyCalories] = useState<any[]>([]);
  const [chatDetailLoading, setChatDetailLoading] = useState(false);
  const [selectedChatSession, setSelectedChatSession] = useState<any>(null);
  const [showChatDetailModal, setShowChatDetailModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [userRes, mealsRes, plansRes, chatsRes, reviewsRes] = await Promise.all([
        api.get(`/admin/users/${id}`),
        api.get(`/meals/history?userId=${id}&limit=10`).catch(() => ({ data: { data: [] } })),
        api.get(`/admin/users/${id}/meal-plans`).catch(() => ({ data: { data: [] } })), 
        api.get(`/chat/sessions?userId=${id}`).catch(() => ({ data: { data: [] } })),
        api.get(`/admin/reviews?userId=${id}`).catch(() => ({ data: { data: [] } })),
      ]);
      setUser(userRes.data.data);
      setMeals(mealsRes.data.data || []);
      setMealPlans(plansRes.data.data || []);
      setChats(chatsRes.data.data || []);
      setReviews(reviewsRes.data.data || []);
      // Lấy dữ liệu calo tuần (có thể cần userId)
      const weekly = await api.get(`/statistics/weekly?userId=${id}`).catch(() => ({ data: { data: { daily: [] } } }));
      setWeeklyCalories(weekly.data.data.daily || []);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [id]);

  const handleBan = async () => {
    await api.put(`/admin/users/${user.id}/ban`);
    toast.success(user.isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa');
    setUser({ ...user, isActive: !user.isActive });
    setShowBanModal(false);
  };

  const handleResetPassword = async () => {
    await api.put(`/admin/users/${user.id}/reset-password`);
    toast.success('Mật khẩu đã được đặt lại thành 123456');
    setShowResetModal(false);
  };

  const handleDelete = async () => {
    await api.delete(`/admin/users/${user.id}`);
    toast.success('Đã xóa người dùng');
    navigate('/admin/users');
  };

  const handleOpenChatSession = async (sessionId: number) => {
    setShowChatDetailModal(true);
    setChatDetailLoading(true);
    setSelectedChatSession(null);
    try {
      const response = await api.get(`/chat/sessions/${sessionId}?userId=${id}`);
      setSelectedChatSession(response.data.data || null);
    } catch {
      toast.error('Khong th? tai chi tiet phien chat AI');
      setShowChatDetailModal(false);
    } finally {
      setChatDetailLoading(false);
    }
  };

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return null;
    const bmi = weight / ((height / 100) ** 2);
    return bmi.toFixed(1);
  };

  // Hàm tính tổng calo trung bình tuần
  const averageCalories = meals.length > 0 
    ? Math.round(meals.reduce((sum, m) => sum + m.calories, 0) / meals.length) 
    : 0;
  // Tính % đạt mục tiêu calo
  const targetCalories = user?.profile?.targetCalories || 2000;
  const percentAchieved = targetCalories > 0 ? Math.min(100, Math.round((averageCalories / targetCalories) * 100)) : 0;

  // Dữ liệu phân bố dinh dưỡng (lấy từ profile hoặc tính từ meals)
  const nutritionData = [
    { name: 'Đạm', value: user?.profile?.targetProtein || 150, color: '#0088FE' },
    { name: 'Béo', value: user?.profile?.targetFat || 55, color: '#00C49F' },
    { name: 'Bột', value: user?.profile?.targetCarbs || 250, color: '#FFBB28' },
  ];

  if (loading) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  if (!user) {
    return <EmptyState icon={User} title="Không tìm thấy người dùng" description="Người dùng không tồn tại hoặc đã bị xóa." />;
  }

  const profile = user.profile || {};
  const bmi = calculateBMI(profile.height, profile.weight);

  return (
    <div className="space-y-6 p-6 text-gray-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/users')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{user.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowBanModal(true)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition ${user.isActive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
            {user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
            {user.isActive ? 'Khóa' : 'Mở khóa'}
          </button>
          <button onClick={() => setShowResetModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-2xl hover:bg-blue-200 transition">
            <Key size={18} /> Reset mật khẩu
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-2xl hover:bg-red-200 transition">
            <Trash2 size={18} /> Xóa
          </button>
        </div>
      </div>

      {/* Cards thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng bữa ăn</p>
              <p className="text-2xl font-bold">{meals.length}</p>
            </div>
            <Utensils size={28} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng lượt scan</p>
              <p className="text-2xl font-bold">{user?._count?.scanHistory ?? 0}</p>
            </div>
            <Camera size={28} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Calo TB/ngày</p>
              <p className="text-2xl font-bold">{averageCalories}</p>
            </div>
            <Activity size={28} className="text-yellow-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Đạt mục tiêu</p>
              <p className="text-2xl font-bold">{percentAchieved}%</p>
            </div>
            <Target size={28} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Thông tin cá nhân + Hồ sơ sức khỏe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><User size={20} /> Thông tin cá nhân</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{user.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Vai trò</span><span className="capitalize">{user.role}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trạng thái</span>
              {!user.isActive ? (
                <span className="text-red-600 flex items-center gap-1"><XCircle size={16} /> Bị khóa</span>
              ) : user.isOnline ? (
                <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16} /> Đang online</span>
              ) : (
                <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1"><CheckCircle size={16} /> Offline</span>
              )}
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Ngày tham gia</span>{formatAdminDate(user.createdAt)}</div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Activity size={20} /> Hồ sơ sức khỏe</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Chiều cao</span>{profile.height ? `${profile.height} cm` : 'Chưa cập nhật'}</div>
            <div className="flex justify-between"><span className="text-gray-500">Cân nặng</span>{profile.weight ? `${profile.weight} kg` : 'Chưa cập nhật'}</div>
            <div className="flex justify-between"><span className="text-gray-500">BMI</span>{bmi ? `${bmi} (${Number(bmi) < 18.5 ? 'Gầy' : Number(bmi) < 25 ? 'Bình thường' : Number(bmi) < 30 ? 'Thừa cân' : 'Béo phì'})` : 'Chưa đủ dữ liệu'}</div>
            <div className="flex justify-between"><span className="text-gray-500">Calo mục tiêu</span>{profile.targetCalories || 2000} kcal</div>
            <div className="flex justify-between"><span className="text-gray-500">Đạm / Béo / Bột</span>{profile.targetProtein || 150}g / {profile.targetFat || 55}g / {profile.targetCarbs || 250}g</div>
            <div className="flex justify-between"><span className="text-gray-500">Dị ứng</span>{profile.allergies?.length ? profile.allergies.join(', ') : 'Không có'}</div>
          </div>
        </div>
      </div>

      {/* Biểu đồ calo theo tuần */}
      {weeklyCalories.length > 0 && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp size={20} /> Xu hướng calo 7 ngày</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyCalories}>
              <defs><linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="calories" stroke="#8884d8" fillOpacity={1} fill="url(#colorCal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Phân bố dinh dưỡng */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieChartIcon size={20} /> Phân bố dinh dưỡng mục tiêu</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={nutritionData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
              {nutritionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bữa ăn gần đây */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Utensils size={20} /> Bữa ăn gần đây</h2>
        {meals.length === 0 ? (
          <div className="text-center text-gray-500 py-6">Chưa có bữa ăn nào</div>
        ) : (
          <div className="space-y-3">
            {meals.slice(0, 10).map(meal => (
              <div key={meal.id} className="flex items-center justify-between p-3 border rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer" onClick={() => navigate(`/admin/meals/${meal.id}`)}>
                <div className="flex items-center gap-3">
                  {meal.food?.imageUrl && <img src={meal.food.imageUrl} alt={meal.food.name} className="w-12 h-12 rounded-full object-cover" />}
                  <div>
                    <div className="font-medium">{meal.food?.name}</div>
                    <div className="text-sm text-gray-500">{formatAdminDateTime(meal.eatenAt)} - {meal.mealType}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{meal.calories} kcal</div>
                  <div className="text-xs text-gray-400">SL: {meal.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

{/* Kế hoạch bữa ăn */}
<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold flex items-center gap-2">
      <Calendar size={20} /> Kế hoạch bữa ăn
    </h2>
    <button 
      onClick={() => navigate(`/admin/users/${user.id}/meal-plans`)} 
      className="text-sm text-blue-600 hover:underline"
    >
      Quản lý
    </button>
  </div>
  {mealPlans.length === 0 ? (
    <div className="text-center text-gray-500 py-6">Chưa có kế hoạch nào</div>
  ) : (
    <div className="space-y-3">
      {mealPlans.slice(0, 3).map((plan) => (
        <div key={plan.id} className="flex justify-between items-center p-3 border rounded-2xl">
          <div>
            <div className="font-medium">{plan.name}</div>
            <div className="text-sm text-gray-500">
              {formatAdminDate(plan.startDate)} - {formatAdminDate(plan.endDate)}
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {plan.isActive ? 'Đang áp dụng' : 'Đã kết thúc'}
          </span>
        </div>
      ))}
      {mealPlans.length > 3 && (
        <div className="text-center text-sm text-gray-500">
          ... và {mealPlans.length - 3} kế hoạch khác
        </div>
      )}
    </div>
  )}
</div>

      {/* Lịch sử chat AI */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare size={20} /> Lịch sử chat AI</h2>
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 py-6">Chưa có phiên chat nào</div>
        ) : (
          <div className="space-y-3">
            {chats.slice(0, 5).map(chat => (
              <div key={chat.id} className="flex justify-between items-center p-3 border rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition" onClick={() => void handleOpenChatSession(chat.id)}>
                <div>
                  <div className="font-medium">{chat.title}</div>
                  <div className="text-sm text-gray-500">Tin nhắn: {chat._count?.messages || 0}</div>
                </div>
                <div className="text-xs text-gray-400">{formatAdminDate(chat.updatedAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Đánh giá đã viết */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Star size={20} /> Đánh giá đã viết</h2>
        {reviews.length === 0 ? (
          <div className="text-center text-gray-500 py-6">Chưa có đánh giá nào</div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 5).map(review => (
              <div key={review.id} className="p-3 border rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{review.food?.name}</span>
                  <div className="flex items-center gap-0.5">{[...Array(review.rating)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}</div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{review.comment}</p>
                <div className="text-xs text-gray-400 mt-1">{formatAdminDate(review.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showChatDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedChatSession?.title || 'Chi tiet phien chat AI'}
                </h3>
                {selectedChatSession?.updatedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Cap nhat: {formatAdminDateTime(selectedChatSession.updatedAt)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowChatDetailModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 inline-flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5 space-y-3 bg-gray-50/40 dark:bg-gray-900/40">
              {chatDetailLoading ? (
                <div className="py-16 flex items-center justify-center">
                  <Loader2 size={26} className="animate-spin text-emerald-500" />
                </div>
              ) : !selectedChatSession?.messages?.length ? (
                <div className="py-12 text-center text-gray-500">Phien nay chua co tin nhan.</div>
              ) : (
                selectedChatSession.messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                        msg.role === 'USER'
                          ? 'bg-emerald-600 text-white'
                          : msg.role === 'ASSISTANT'
                          ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <div className="text-[11px] font-semibold mb-1 opacity-80">
                        {msg.role === 'USER' ? 'User' : msg.role === 'ASSISTANT' ? 'Food AI' : msg.role}
                      </div>
                      <div>{msg.content}</div>
                      <div className={`text-[10px] mt-1 ${msg.role === 'USER' ? 'text-emerald-100' : 'text-gray-400'}`}>
                        {formatAdminDateTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal isOpen={showBanModal} onClose={() => setShowBanModal(false)} onConfirm={handleBan} title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} message={user.isActive ? `Bạn có chắc muốn khóa tài khoản ${user.name}?` : `Bạn có chắc muốn mở khóa tài khoản ${user.name}?`} confirmText={user.isActive ? 'Khóa' : 'Mở khóa'} />
      <ConfirmModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} onConfirm={handleResetPassword} title="Reset mật khẩu" message={`Đặt lại mật khẩu của ${user.name} thành 123456?`} confirmText="Reset" />
      <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Xóa tài khoản" message={`Bạn có chắc muốn xóa vĩnh viễn tài khoản ${user.name}? Hành động này không thể hoàn tác.`} confirmText="Xóa" />
    </div>
  );
};

export default AdminUserDetail;
