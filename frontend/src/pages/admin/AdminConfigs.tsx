import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, RefreshCw } from 'lucide-react';

const AdminConfigs = () => {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings') // dùng chung endpoint settings
      .then(res => { setConfigs(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateConfig = async (key: string, value: string) => {
    try {
      await api.put(`/admin/settings/${key}`, { value });
      setConfigs({ ...configs, [key]: value });
      toast.success('Đã cập nhật');
    } catch (error) { toast.error('Cập nhật thất bại'); }
  };

  const resetDefaults = async () => {
    if (confirm('Reset tất cả cấu hình về mặc định?')) {
      setSaving(true);
      try {
        const defaults = {
          week_start_day: 'Monday',
          date_format: 'DD/MM/YYYY',
          timezone: 'Asia/Ho_Chi_Minh',
          default_stats_days: '7',
          calorie_warning_threshold: '110',
          bmr_formula: 'Mifflin-St Jeor',
          macro_ratio_protein: '30',
          macro_ratio_fat: '25',
          macro_ratio_carbs: '45',
          ai_recommendation_model: 'gemini-1.5-flash',
          ai_temperature: '0.7',
          ai_max_suggestions: '5',
          ai_min_confidence: '0.7',
          ai_system_prompt: 'Bạn là chuyên gia dinh dưỡng AI, hãy trả lời ngắn gọn, hữu ích.',
          max_meals_per_day: '20',
          max_scans_per_day_free: '10',
          max_scans_per_day_premium: '50',
          chat_history_retention_days: '90',
          auto_approve_reviews: 'false',
          banned_keywords: 'spam, linh tinh',
        };
        for (const [key, value] of Object.entries(defaults)) {
          await api.put(`/admin/settings/${key}`, { value });
          setConfigs(prev => ({ ...prev, [key]: value }));
        }
        toast.success('Đã reset về mặc định');
      } catch (error) { toast.error('Reset thất bại'); } finally { setSaving(false); }
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Cấu hình AI & Dinh dưỡng</h1>
          <p className="text-gray-500">Tùy chỉnh các tham số AI, dinh dưỡng và giới hạn người dùng</p>
        </div>
        <button onClick={resetDefaults} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-2xl">
          <RefreshCw size={18} /> Reset mặc định
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cài đặt dinh dưỡng */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">🥗 Dinh dưỡng & Calo</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Ngày bắt đầu tuần</label><select value={configs.week_start_day || 'Monday'} onChange={e=>updateConfig('week_start_day',e.target.value)} className="w-full border rounded-xl px-4 py-2"><option value="Monday">Thứ Hai</option><option value="Sunday">Chủ Nhật</option></select><p className="text-xs text-gray-500">Ảnh hưởng đến biểu đồ thống kê tuần</p></div>
            <div><label className="block text-sm font-medium">Định dạng ngày</label><select value={configs.date_format || 'DD/MM/YYYY'} onChange={e=>updateConfig('date_format',e.target.value)} className="w-full border rounded-xl px-4 py-2"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
            <div><label className="block text-sm font-medium">Múi giờ</label><select value={configs.timezone || 'Asia/Ho_Chi_Minh'} onChange={e=>updateConfig('timezone',e.target.value)} className="w-full border rounded-xl px-4 py-2"><option>Asia/Ho_Chi_Minh</option><option>UTC</option></select></div>
            <div><label className="block text-sm font-medium">Số ngày thống kê mặc định</label><input type="number" value={configs.default_stats_days || '7'} onChange={e=>updateConfig('default_stats_days',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Ngưỡng cảnh báo calo (%)</label><input type="number" value={configs.calorie_warning_threshold || '110'} onChange={e=>updateConfig('calorie_warning_threshold',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Công thức BMR</label><select value={configs.bmr_formula || 'Mifflin-St Jeor'} onChange={e=>updateConfig('bmr_formula',e.target.value)} className="w-full border rounded-xl px-4 py-2"><option>Harris-Benedict</option><option>Mifflin-St Jeor</option></select></div>
            <div><label className="block text-sm font-medium">Macro ratio mặc định (Protein/Fat/Carbs %)</label><div className="flex gap-2"><input type="number" placeholder="Protein" value={configs.macro_ratio_protein || '30'} onChange={e=>updateConfig('macro_ratio_protein',e.target.value)} className="w-1/3 border rounded-xl px-2 py-1" /><input type="number" placeholder="Fat" value={configs.macro_ratio_fat || '25'} onChange={e=>updateConfig('macro_ratio_fat',e.target.value)} className="w-1/3 border rounded-xl px-2 py-1" /><input type="number" placeholder="Carbs" value={configs.macro_ratio_carbs || '45'} onChange={e=>updateConfig('macro_ratio_carbs',e.target.value)} className="w-1/3 border rounded-xl px-2 py-1" /></div></div>
          </div>
        </div>

        {/* Cấu hình AI Recommendation */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">🤖 AI Recommendation</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Model AI</label><input type="text" value={configs.ai_recommendation_model || 'gemini-1.5-flash'} onChange={e=>updateConfig('ai_recommendation_model',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Temperature (sáng tạo)</label><input type="number" step="0.1" min="0" max="1" value={configs.ai_temperature || '0.7'} onChange={e=>updateConfig('ai_temperature',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Số lượng món gợi ý mỗi lần</label><input type="number" value={configs.ai_max_suggestions || '5'} onChange={e=>updateConfig('ai_max_suggestions',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Ngưỡng độ chính xác tối thiểu khi scan ảnh</label><input type="number" step="0.01" min="0" max="1" value={configs.ai_min_confidence || '0.7'} onChange={e=>updateConfig('ai_min_confidence',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">System prompt mặc định cho AI</label><textarea rows={3} value={configs.ai_system_prompt || 'Bạn là chuyên gia dinh dưỡng AI, hãy trả lời ngắn gọn, hữu ích.'} onChange={e=>updateConfig('ai_system_prompt',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
          </div>
        </div>

        {/* Quy tắc & Giới hạn người dùng */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">👥 Quy tắc & Giới hạn</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Số bữa ăn tối đa/ngày</label><input type="number" value={configs.max_meals_per_day || '20'} onChange={e=>updateConfig('max_meals_per_day',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Số scan tối đa/ngày (Free)</label><input type="number" value={configs.max_scans_per_day_free || '10'} onChange={e=>updateConfig('max_scans_per_day_free',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Số scan tối đa/ngày (Premium)</label><input type="number" value={configs.max_scans_per_day_premium || '50'} onChange={e=>updateConfig('max_scans_per_day_premium',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Thời gian giữ lịch sử chat AI (ngày)</label><input type="number" value={configs.chat_history_retention_days || '90'} onChange={e=>updateConfig('chat_history_retention_days',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
          </div>
        </div>

        {/* Moderation */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">📝 Nội dung & Moderation</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Từ khóa bị cấm trong review</label><textarea rows={2} value={configs.banned_keywords || 'spam, linh tinh'} onChange={e=>updateConfig('banned_keywords',e.target.value)} className="w-full border rounded-xl px-4 py-2" placeholder="Cách nhau bằng dấu phẩy" /></div>
            <div><label className="flex items-center gap-2"><input type="checkbox" checked={configs.auto_approve_reviews === 'true'} onChange={e=>updateConfig('auto_approve_reviews', e.target.checked ? 'true' : 'false')} /> Tự động duyệt đánh giá (không chứa từ cấm)</label></div>
            <div><label className="flex items-center gap-2"><input type="checkbox" checked={configs.enable_meal_plan_ai === 'true'} onChange={e=>updateConfig('enable_meal_plan_ai', e.target.checked ? 'true' : 'false')} /> Bật tính năng Meal Plan AI</label></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigs;