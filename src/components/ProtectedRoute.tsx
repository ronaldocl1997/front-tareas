import { Navigate } from 'react-router-dom';
import { getAuthData } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user } = getAuthData();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}