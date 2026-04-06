import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="space-y-6"><div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse"></div></div>;

  const appSettings = [
    { key: 'app_name', label: 'Tên ứng dụng', placeholder: 'Food AI System', type: 'text' },
    { key: 'support_email', label: 'Email hỗ trợ', placeholder: 'support@foodai.com', type: 'email' },
    { key: 'max_upload_size', label: 'Giới hạn upload ảnh (MB)', placeholder: '10', type: 'number' },
    { key: 'maintenance_mode', label: 'Chế độ bảo trì', type: 'select', options: ['0', '1'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Cài đặt ứng dụng</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Cấu hình chung cho hệ thống</p>
      </div>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 rounded-3xl shadow-xl p-6">
        <div className="space-y-4">
          {appSettings.map((item) => (
            <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <label className="font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">{item.label}</label>
              {item.type === 'select' ? (
                <select
                  value={settings[item.key] || item.options?.[0]}
                  onChange={(e) => updateSetting(item.key, e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 w-full sm:w-64"
                >
                  {item.options?.map(opt => <option key={opt} value={opt}>{opt === '0' ? 'Tắt' : 'Bật'}</option>)}
                </select>
              ) : (
                <input
                  type={item.type}
                  value={settings[item.key] || ''}
                  onChange={(e) => updateSetting(item.key, e.target.value)}
                  placeholder={item.placeholder}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 w-full sm:w-64"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;