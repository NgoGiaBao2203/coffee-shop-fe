import { useState, useEffect, useCallback, useRef } from 'react';
import { getDrinksApi } from '../api/drinksAPI';
import type { DrinkItem, GetDrinksRequest } from '../types';

const DEFAULT_PARAMS: GetDrinksRequest = {
  page: 1,
  size: 10,
  keyword: '',
};

export function useDrinks(initialPage = 1, initialSize = 10) {
  const [params, setParams] = useState<GetDrinksRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  const [items, setItems] = useState<DrinkItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  // Track whether the current action was triggered by explicit user search
  const isSearchActionRef = useRef(false);

  // Core API fetcher function
  const fetchDrinks = useCallback(async (currentParams: GetDrinksRequest) => {
    const isSearchAction = isSearchActionRef.current;
    isSearchActionRef.current = false;

    setLoading(true);
    if (isSearchAction) setSearchLoading(true);

    try {
      const payload: GetDrinksRequest = {
        page: currentParams.page,
        size: currentParams.size,
        keyword: currentParams.keyword?.trim() || undefined,
      };

      const response = await getDrinksApi(payload);
      const resItems = response.items ?? [];

      setItems(resItems);
      setTotalElements(response.pagination?.totalElements ?? resItems.length ?? 0);

      // Show error modal if user explicitly searched but got empty result
      if (isSearchAction && currentParams.keyword?.trim() && resItems.length === 0) {
        setShowEmptyModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch drinks:', err);
      if (isSearchAction && currentParams.keyword?.trim()) {
        setShowEmptyModal(true);
      }
      setItems([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, []);

  // Synchronize data fetching with params update using asynchronous IIFE
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchDrinks(params);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [params, fetchDrinks]);

  // Handle keyword search and reset pagination to page 1
  const handleSearch = (keyword: string) => {
    isSearchActionRef.current = true;
    setParams((prev) => ({
      ...prev,
      keyword: keyword.trim(),
      page: 1,
    }));
  };

  // Handle page or page size changes
  const handlePageChange = (page: number, size?: number) => {
    isSearchActionRef.current = false;
    setParams((prev) => ({
      ...prev,
      page,
      size: size ?? prev.size,
    }));
  };

  return {
    items,
    totalElements,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.keyword ?? '',
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handlePageChange,
    refresh: () => fetchDrinks(params),
  };
}