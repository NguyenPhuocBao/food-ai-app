import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import DiaryPage from './pages/DiaryPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import UserLayout from './components/user/UserLayout';
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
import AdminRecipeDetail from './pages/admin/AdminRecipeDetail';
import AdminRecipeEdit from './pages/admin/AdminRecipeEdit';
import AdminMealPlans from './pages/admin/AdminMealPlans';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/diary" element={<DiaryPage />} />
              <Route path="/chat-ai" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
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
              <Route path="recipes/:foodId" element={<AdminRecipeDetail />} />
              <Route path="recipes/:foodId/edit" element={<AdminRecipeEdit />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="users/:userId/meal-plans" element={<AdminMealPlans />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;