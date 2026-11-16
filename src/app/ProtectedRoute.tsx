import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ENV } from '@/constants/evn';
import { useAppSelector } from '@/store/hooks';
import { ROLES, canAccessPath, getHomePath } from '@/permission/roles';

export function ProtectedRoute() {
  const profile = useAppSelector((state) => state.auth.profile);
  const { pathname } = useLocation();

  // In mock mode, bypass authentication for development (mock user acts as owner)
  if (ENV.ENABLE_MOCK) {
    return pathname === '/' ? <Navigate to={getHomePath(ROLES.OWNER)} replace /> : <Outlet />;
  }

  // Require a loaded profile — redirect to login if missing
  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Send "/" and routes the role cannot access to the role's landing page,
  // so the page never calls an API the backend rejects with 403
  const homePath = getHomePath(profile.roleName);
  if (pathname === '/' || !canAccessPath(pathname, profile.roleName)) {
    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
}
