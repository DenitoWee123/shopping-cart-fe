import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RequireGuestProps {
  children: React.ReactNode;
}

export default function RequireGuest({ children }: RequireGuestProps) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

