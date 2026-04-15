import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = () => {
  const { user, admin, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user && admin) return <Navigate to="/admin" replace />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
