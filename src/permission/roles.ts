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
  '/revenue': [ROLES.OWNER, ROLES.MANAGER],
  '/staff': [ROLES.OWNER, ROLES.MANAGER],
  '/shop-branches': [ROLES.OWNER],
};
