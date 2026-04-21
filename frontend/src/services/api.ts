import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor: chọn token phù hợp dựa trên ngữ cảnh request
api.interceptors.request.use((config) => {
  // 1. Kiểm tra xem request có gửi kèm token cụ thể không (ví dụ từ AuthContext init)
  if (config.headers.Authorization) {
    return config;
  }

  // 2. Xác định xem đây là request cho Admin hay User
  // Các route bắt đầu bằng /admin hoặc có query userId thường là dành cho admin
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isAdminRequest =
    config.url?.startsWith('/admin') ||
    config.url?.includes('userId=') ||
    (isAdminRoute && (config.url?.startsWith('/chat') || config.url?.startsWith('/support')));
  
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('token');

  // Tach rieng token theo role, khong fallback cheo:
  // - Request admin chi dung admin_token
  // - Request user chi dung token user
  if (isAdminRequest) {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

// Interceptor response: xử lý lỗi 401 cho từng loại session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config.url;
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      const isAdminRequest =
        url?.startsWith('/admin') ||
        (isAdminRoute && (url?.startsWith('/chat') || url?.startsWith('/support')));

      if (isAdminRequest) {
        localStorage.removeItem('admin_token');
      } else {
        localStorage.removeItem('token');
      }

      // Nếu cả 2 đều mất thì mới redirect về login, 
      // hoặc nếu đang ở route protected tương ứng
      const hasAnyToken = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!hasAnyToken && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const getAssetUrl = (assetPath?: string | null) => {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${API_ORIGIN}${assetPath}`;
};
