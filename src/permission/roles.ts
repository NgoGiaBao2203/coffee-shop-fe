export const ROLES = {
  OWNER: 'CHỦ QUÁN',
  MANAGER: 'QUẢN LÝ',
  STAFF: 'NHÂN VIÊN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Maps each sidebar route key to the roles that are allowed to see it.
 * Routes not listed here are visible to everyone.
 */
export const NAV_PERMISSIONS: Record<string, Role[]> = {
  '/': [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
  '/orders': [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
  '/categories': [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
  '/tables': [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
  '/revenue': [ROLES.OWNER, ROLES.MANAGER],
  '/staff': [ROLES.OWNER, ROLES.MANAGER],
  '/shop': [ROLES.OWNER],
  '/invoices': [ROLES.OWNER, ROLES.MANAGER, ROLES.STAFF],
};

// Landing page per role: after login, on "/" and when opening a route the role cannot access
const HOME_PATHS: Record<Role, string> = {
  [ROLES.OWNER]: '/shop',
  [ROLES.MANAGER]: '/drinks',
  [ROLES.STAFF]: '/drinks',
};

export function getHomePath(role?: string): string {
  return HOME_PATHS[role as Role] ?? '/drinks';
}

// Routes not listed in NAV_PERMISSIONS are open to every role
export function canAccessPath(path: string, role?: string): boolean {
  const allowedRoles = NAV_PERMISSIONS[path];
  return !allowedRoles || allowedRoles.includes(role as Role);
}
