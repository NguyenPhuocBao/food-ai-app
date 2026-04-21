import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import RouteTitle from './components/common/RouteTitle';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanRealPageV2';
import DiaryPage from './pages/DiaryPage';
import ChatPage from './pages/ChatPageV2';
import ProfilePage from './pages/ProfilePageV2';
import OnboardingPage from './pages/OnboardingPage';
import StatisticsPage from './pages/StatisticsPage';
import FoodsPage from './pages/FoodsPage';
import FoodDetailPage from './pages/FoodDetailViewPage';
import RecipesPage from './pages/RecipesPage';
import MealPlansPage from './pages/MealPlansPage';
import LibraryPage from './pages/LibraryPage';
import RecommendationsPage from './pages/RecommendationsPage';
import WeeklyReportsPage from './pages/WeeklyReportsPage';
import UserLayout from './components/user/UserShell';
import AdminDashboard from './pages/admin/AdminDashboardV2';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFoods from './pages/admin/AdminFoods';
import AdminRecipes from './pages/admin/AdminRecipes';
import AdminReviews from './pages/admin/AdminReviewsV2';
import AdminChatHistory from './pages/admin/AdminChatHistoryV2';
import AdminConfigs from './pages/admin/AdminConfigs';
import AdminAuditLogs from './pages/admin/AdminAuditLogsV2';
import AdminNotifications from './pages/admin/AdminNotificationsV2';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminFoodDetail from './pages/admin/AdminFoodDetail';
import AdminRecipeDetail from './pages/admin/AdminRecipeDetail';
import AdminRecipeEdit from './pages/admin/AdminRecipeEdit';
import AdminMealPlans from './pages/admin/AdminMealPlans';
import AdminMealDetail from './pages/admin/AdminMealDetail';
import AdminChatbotOps from './pages/admin/AdminChatbotOps';
import SupportChatWidget from './components/common/SupportChatWidget';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteTitle />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/diary" element={<DiaryPage />} />
              <Route path="/chat-ai" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/foods" element={<FoodsPage />} />
              <Route path="/foods/:id" element={<FoodDetailPage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/meal-plans" element={<MealPlansPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/weekly-reports" element={<WeeklyReportsPage />} />
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
              <Route path="chatbot-ops" element={<AdminChatbotOps />} />
              <Route path="configs" element={<AdminConfigs />} />
              <Route path="logs" element={<AdminAuditLogs />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="foods/:id" element={<AdminFoodDetail />} />
              <Route path="recipes/:foodId" element={<AdminRecipeDetail />} />
              <Route path="recipes/:foodId/edit" element={<AdminRecipeEdit />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="users/:userId/meal-plans" element={<AdminMealPlans />} />
              <Route path="meals/:id" element={<AdminMealDetail />} />
            </Route>
          </Route>
        </Routes>
        <SupportChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
