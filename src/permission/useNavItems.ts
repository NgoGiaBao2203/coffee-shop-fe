import type { MenuProps } from 'antd';
import { ENV } from '@/constants/evn';
import { useAppSelector } from '@/store/hooks';
import { NAV_PERMISSIONS, type Role } from './roles';

export function useNavItems(allItems: MenuProps['items']): MenuProps['items'] {
  const profile = useAppSelector((state) => state.auth.profile);

  // Mock mode — bypass all permission checks
  if (ENV.ENABLE_MOCK) return allItems;

  const role = profile?.roleName as Role;

  return allItems?.filter((item) => {
    if (!item || !('key' in item) || !item.key) return true;
    const allowedRoles = NAV_PERMISSIONS[item.key as string];
    if (!allowedRoles) return true;
    return allowedRoles.includes(role);
  });
}
