import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFoods from './pages/admin/AdminFoods';
import AdminRecipes from './pages/admin/AdminRecipes';
import AdminReviews from './pages/admin/AdminReviews';
import AdminChatHistory from './pages/admin/AdminChatHistory';
import AdminConfigs from './pages/admin/AdminConfigs';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminFoodDetail from './pages/admin/AdminFoodDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="foods" element={<AdminFoods />} />
              <Route path="recipes" element={<AdminRecipes />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="chat-ai" element={<AdminChatHistory />} />
              <Route path="configs" element={<AdminConfigs />} />
              <Route path="logs" element={<AdminAuditLogs />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="foods/:id" element={<AdminFoodDetail />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;