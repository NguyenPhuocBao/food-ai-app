import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save, RefreshCw } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then(res => { setSettings(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      await api.put(`/admin/settings/${key}`, { value });
      setSettings({ ...settings, [key]: value });
      toast.success('Đã cập nhật');
    } catch (error) { toast.error('Cập nhật thất bại'); }
  };

  const resetDefaults = async () => {
    if (confirm('Reset tất cả cài đặt về mặc định?')) {
      setSaving(true);
      try {
        const defaults = {
          app_name: 'Food AI System',
          support_email: 'support@foodai.com',
          support_phone: '',
          max_upload_size: '10',
          jwt_expires_in: '7d',
          max_login_attempts: '5',
        };
        for (const [key, value] of Object.entries(defaults)) {
          await api.put(`/admin/settings/${key}`, { value });
          setSettings(prev => ({ ...prev, [key]: value }));
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Cài đặt hệ thống</h1>
          <p className="text-gray-500">Quản lý cấu hình chung của ứng dụng</p>
        </div>
        <button onClick={resetDefaults} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-2xl">
          <RefreshCw size={18} /> Reset mặc định
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin cơ bản */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin ứng dụng</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Tên ứng dụng</label><input type="text" value={settings.app_name || 'Food AI'} onChange={e=>updateSetting('app_name',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Email hỗ trợ</label><input type="email" value={settings.support_email || ''} onChange={e=>updateSetting('support_email',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Số điện thoại hỗ trợ</label><input type="text" value={settings.support_phone || ''} onChange={e=>updateSetting('support_phone',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
          </div>
        </div>

        {/* Giới hạn kỹ thuật */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Bảo mật & Giới hạn</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">Giới hạn upload ảnh (MB)</label><input type="number" value={settings.max_upload_size || '10'} onChange={e=>updateSetting('max_upload_size',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">JWT hết hạn sau (ngày)</label><input type="text" value={settings.jwt_expires_in || '7d'} onChange={e=>updateSetting('jwt_expires_in',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">Số lần đăng nhập sai tối đa</label><input type="number" value={settings.max_login_attempts || '5'} onChange={e=>updateSetting('max_login_attempts',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
          </div>
        </div>

        {/* AI Model & API Keys (nếu có) */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Tích hợp AI</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium">AI Model</label><input type="text" value={settings.ai_model || 'gpt-3.5-turbo'} onChange={e=>updateSetting('ai_model',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div><label className="block text-sm font-medium">API Key (Gemini/OpenAI)</label><input type="password" value={settings.ai_api_key || ''} onChange={e=>updateSetting('ai_api_key',e.target.value)} className="w-full border rounded-xl px-4 py-2" /></div>
            <div className="text-xs text-gray-500">⚠️ API key chỉ hiển thị khi nhập mới</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;