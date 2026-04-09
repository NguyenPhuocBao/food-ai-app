import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/auth.service';
import toast from 'react-hot-toast';
import { LogOut, Activity, ShieldCheck, Calendar, Lock, User as UserIcon, Bell, Target, Smartphone, Flame, Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.profile?.fullName || user?.name || '',
    height: user?.profile?.height || '',
    weight: user?.profile?.weight || '',
    activityLevel: (user?.profile as any)?.activityLevel || 'MODERATE',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sync form when user loads from backend
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.profile?.fullName || user.name || '',
        height: user.profile?.height || '',
        weight: user.profile?.weight || '',
        activityLevel: (user.profile as any)?.activityLevel || 'MODERATE',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        fullName: formData.fullName,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        activityLevel: formData.activityLevel,
      } as any);
      toast.success('Cập nhật thông tin thành công!');
      await refreshUser();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const bmi = (() => {
    const h = Number(formData.height) / 100;
    const w = Number(formData.weight);
    if (!h || !w) return null;
    return (w / (h * h)).toFixed(1);
  })();

  const bmiStatus = (() => {
    const v = Number(bmi);
    if (!bmi) return '--';
    if (v < 18.5) return 'Thiếu cân';
    if (v < 25) return 'Bình thường';
    if (v < 30) return 'Thừa cân';
    return 'Béo phì';
  })();

  const menuItems = [
    { icon: UserIcon, label: 'Thông tin cá nhân', active: true },
    { icon: Target, label: 'Cài đặt mục tiêu' },
    { icon: Calendar, label: 'Kế hoạch ăn uống' },
    { icon: Activity, label: 'Lịch sử tư vấn' },
    { icon: Bell, label: 'Thông báo' },
    { icon: Lock, label: 'Bảo mật & Mật khẩu' },
    { icon: Smartphone, label: 'Đồng bộ thiết bị' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Sidebar Menu */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-hidden sticky top-24">
          <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-500 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full border-2 border-white bg-white flex items-center justify-center text-emerald-600 font-black text-xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight truncate">{user?.name || 'Nguyễn Phước'}</h2>
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mt-1">Master Chef AI</p>
            </div>
          </div>
          <div className="p-3 flex flex-col gap-1">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${item.active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon size={18} className={item.active ? "text-emerald-500" : "text-gray-400"} />
                {item.label}
              </button>
            ))}

            <div className="my-2 border-t border-gray-50"></div>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-6">

          <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm p-8">
            <h1 className="text-2xl font-black text-gray-900 mb-6">Thông tin cá nhân</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Họ và Tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 font-medium cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Chiều cao (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="Vd: 172"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Cân nặng (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="Vd: 65"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mức hoạt động</label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium appearance-none">
                    <option value="SEDENTARY">Nhẹ nhàng (Văn phòng, ít vận động)</option>
                    <option value="LIGHT">Nhẹ (Tập thể dục 1-3 ngày/tuần)</option>
                    <option value="MODERATE">Vừa phải (Tập thể dục 3-5 ngày/tuần)</option>
                    <option value="ACTIVE">Cao (Chơi thể thao thường xuyên)</option>
                    <option value="VERY_ACTIVE">Rất cao (Vận động nặng mỗi ngày)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-8 pt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 px-6 py-3 rounded-xl text-white font-bold transition-colors shadow-sm"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isSaving ? 'Đang lưu...' : 'Cập nhật thông tin'}
              </button>
            </div>
          </div>

          {/* Health Stats Web Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-500 text-white rounded-[24px] p-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between h-40">
              <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                <Target size={120} />
              </div>
              <span className="text-emerald-100 font-bold uppercase tracking-wider text-xs relative z-10">BMI HIỆN TẠI</span>
              <span className="text-4xl font-black relative z-10">
                {bmi ?? '--'}{' '}
                <span className="text-sm font-bold text-emerald-200">{bmiStatus}</span>
              </span>
            </div>

            <div className="bg-white border border-gray-100 text-gray-900 rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">NGÀY STREAK</span>
              <div className="flex items-center gap-2">
                <Flame size={32} className="text-amber-500" />
                <span className="text-4xl font-black">12</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 text-gray-900 rounded-[24px] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">BỮA ĂN ĐÃ GHI NHẬN</span>
              <div className="flex items-center gap-3">
                <ShieldCheck size={32} className="text-emerald-500" />
                <span className="text-4xl font-black">48</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
