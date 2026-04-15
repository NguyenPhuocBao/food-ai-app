import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = () => {
  const { admin, user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!admin && user) return <Navigate to="/" replace />;
  if (!admin) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default AdminRoute;
