import { useState, useEffect, useCallback } from 'react';
import { getShopsApi } from '../api/shopAPI';
import type { ShopItem, SearchShopRequest, ShopPagination } from '../types';

const DEFAULT_PARAMS: SearchShopRequest = {
  page: 1,
  size: 10,
  search: '',
  sortBy: 'shopId',
  sortDirection: 'ASC',
};

export function useShop(initialPage = 1, initialSize = 10) {
  const [params, setParams] = useState<SearchShopRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  const [items, setItems] = useState<ShopItem[]>([]);
  const [pagination, setPagination] = useState<ShopPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const fetchShops = useCallback(
    async (currentParams: SearchShopRequest, isSearchAction = false) => {
      setLoading(true);
      if (isSearchAction) setSearchLoading(true);

      try {
        const payload: SearchShopRequest = {
          page: currentParams.page,
          size: currentParams.size,
          search: currentParams.search?.trim() || undefined,
          sortBy: currentParams.sortBy || 'shopId',
          sortDirection: currentParams.sortDirection || 'ASC',
          shopId: currentParams.shopId || undefined,
        };

        const response = await getShopsApi(payload);
        const resItems = response.items ?? [];

        setItems(resItems);
        setPagination(response.pagination ?? null);

        if (isSearchAction && currentParams.search?.trim() && resItems.length === 0) {
          setShowEmptyModal(true);
        }
      } catch (err) {
        console.error('Failed to fetch shop branches:', err);
        if (isSearchAction && currentParams.search?.trim()) {
          setShowEmptyModal(true);
        }
        setItems([]);
        setPagination(null);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchShops(params, isSearch);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [params, fetchShops, isSearch]);

  const handleSearch = (keyword: string) => {
    setIsSearch(true);
    setParams((prev) => ({
      ...prev,
      search: keyword.trim(),
      page: 1,
    }));
  };

  const handlePageChange = (page: number, size?: number) => {
    setIsSearch(false);
    setParams((prev) => ({
      ...prev,
      page,
      size: size ?? prev.size,
    }));
  };

  return {
    items,
    pagination,
    totalElements: pagination?.totalElements ?? items.length ?? 0,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search ?? '',
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handlePageChange,
    refresh: () => fetchShops(params, false),
  };
}
