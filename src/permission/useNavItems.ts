import type { MenuProps } from 'antd';
import { ENV } from '@/constants/evn';
import { useAppSelector } from '@/store/hooks';
import { canAccessPath } from './roles';

export function useNavItems(allItems: MenuProps['items']): MenuProps['items'] {
  const profile = useAppSelector((state) => state.auth.profile);

  // Mock mode — bypass all permission checks
  if (ENV.ENABLE_MOCK) return allItems;

  return allItems?.filter((item) => {
    if (!item || !('key' in item) || !item.key) return true;
    return canAccessPath(item.key as string, profile?.roleName);
  });
}
