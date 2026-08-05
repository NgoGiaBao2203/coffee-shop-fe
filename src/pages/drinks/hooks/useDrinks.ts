import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { getDrinksApi, createDrinkApi, deleteDrinkApi } from '../api/drinksAPI';
import type { DrinkItem, GetDrinksRequest, CreateDrinkRequest } from '../types';

// Default pagination and sorting parameters
const DEFAULT_PARAMS: GetDrinksRequest = {
  page: 1,
  size: 10,
  search: '',
  sortBy: 'drinkName',
  sortDirection: 'ASC',
};

// Custom hook to handle drinks API fetching, searching, and pagination state
export function useDrinks(initialPage = 1, initialSize = 10) {
  const toast = useToast();
  const { t } = useTranslation();

  // Query parameters state
  const [params, setParams] = useState<GetDrinksRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  // API data states
  const [items, setItems] = useState<DrinkItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Loading and modal UI states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  // Core API requester function
  const fetchDrinks = useCallback(
    async (currentParams: GetDrinksRequest, isSearchAction = false) => {
      setLoading(true);
      if (isSearchAction) setSearchLoading(true);

      try {
        // Build payload matching backend API requirements
        const payload: GetDrinksRequest = {
          page: currentParams.page,
          size: currentParams.size,
          search: currentParams.search?.trim() || '',
          sortBy: currentParams.sortBy || 'drinkName',
          sortDirection: currentParams.sortDirection || 'ASC',
        };

        const response = await getDrinksApi(payload);
        const resItems = response.items ?? [];

        setItems(resItems);
        setTotalElements(response.pagination?.totalElements ?? resItems.length ?? 0);

        // Trigger empty state modal if search yields no records
        if (isSearchAction && currentParams.search?.trim() && resItems.length === 0) {
          setShowEmptyModal(true);
        }
      } catch (err) {
        console.error('Failed to fetch drinks:', err);
        if (isSearchAction && currentParams.search?.trim()) {
          setShowEmptyModal(true);
        }
        setItems([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [],
  );

  // Refetch data whenever query params or search flag changes
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchDrinks(params, isSearch);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [params, fetchDrinks, isSearch]);

  // Handler for creating new drink
  const createDrink = useCallback(
    async (values: CreateDrinkRequest) => {
      setCreateLoading(true);
      try {
        await createDrinkApi(values);
        toast.success(t('drinks.createSuccess'));
        await fetchDrinks(params);
      } catch (error) {
        console.error('Failed to create drink:', error);
        throw error;
      } finally {
        setCreateLoading(false);
      }
    },
    [params, fetchDrinks, toast, t],
  );

  // Handler for deleting drink (Soft Delete)
  const deleteDrink = useCallback(
    async (drinkId: string) => {
      setDeleteLoading(true);
      try {
        await deleteDrinkApi({ drinkId });
        toast.success(t('drinks.deleteSuccess'));
        await fetchDrinks(params);
      } catch (error) {
        console.error('Failed to delete drink:', error);
        toast.error(t('drinks.deleteError'));
      } finally {
        setDeleteLoading(false);
      }
    },
    [params, fetchDrinks, toast, t],
  );

  // Handler for explicit search actions (resets page to 1)
  const handleSearch = (searchKeyword: string) => {
    setIsSearch(true);
    setParams((prev) => ({
      ...prev,
      search: searchKeyword.trim(),
      page: 1,
    }));
  };

  // Handler for pagination page or page size changes
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
    totalElements,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search ?? '',
    loading,
    searchLoading,
    createLoading,
    deleteLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handlePageChange,
    createDrink,
    deleteDrink,
    refresh: () => fetchDrinks(params, false),
  };
}
