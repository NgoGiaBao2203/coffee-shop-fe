import { useEffect, useMemo, useState } from 'react';
import { getShopNamesApi } from '@/api/dropdownApi';
import { ROLES } from '@/permission/roles';
import { useAppSelector } from '@/store/hooks';
import type { ShopNameItem } from '@/types/dropdown';

function isSameShopName(a?: string | null, b?: string | null): boolean {
  return !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

// Shops for select boxes via GET /dropdown/shop-name (OWNER / MANAGER only, STAFF gets 403).
// The API returns every shop even for MANAGER, so a manager only keeps the shop of their profile
// (the login response has no shopId, only shopName).
export function useShopOptions(enabled = true) {
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const profileShopName = useAppSelector((state) => state.auth.profile?.shopName);
  const isManager = roleName === ROLES.MANAGER;
  const canLoad = enabled && (roleName === ROLES.OWNER || isManager);

  const [allShopNames, setAllShopNames] = useState<ShopNameItem[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (!canLoad) return;

    let isMounted = true;

    const loadShopNames = async () => {
      setOptionsLoading(true);
      try {
        const response = await getShopNamesApi();
        if (isMounted) setAllShopNames(response.shopNameResults ?? []);
      } catch {
        if (isMounted) setAllShopNames([]);
      } finally {
        if (isMounted) setOptionsLoading(false);
      }
    };

    void loadShopNames();

    return () => {
      isMounted = false;
    };
  }, [canLoad]);

  const shopNames = useMemo(
    () =>
      isManager
        ? allShopNames.filter((shop) => isSameShopName(shop.shopName, profileShopName))
        : allShopNames,
    [allShopNames, isManager, profileShopName],
  );

  const shopOptions = useMemo(
    () => shopNames.map(({ shopId, shopName }) => ({ value: shopId, label: shopName })),
    [shopNames],
  );

  return { shopNames, shopOptions, optionsLoading };
}
