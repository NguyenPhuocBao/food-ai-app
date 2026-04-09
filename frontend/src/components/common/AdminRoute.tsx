import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = () => {
  const { admin, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!admin) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;