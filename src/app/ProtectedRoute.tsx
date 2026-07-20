import { Navigate, Outlet } from 'react-router-dom';
import { ENV } from '@/constants/evn';
import { useAppSelector } from '@/store/hooks';

export function ProtectedRoute() {
  const profile = useAppSelector((state) => state.auth.profile);

  // In mock mode, bypass authentication for development
  if (ENV.ENABLE_MOCK) {
    return <Outlet />;
  }

  // Require a loaded profile — redirect to login if missing
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
