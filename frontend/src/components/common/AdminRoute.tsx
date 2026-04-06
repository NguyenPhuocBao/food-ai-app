import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;