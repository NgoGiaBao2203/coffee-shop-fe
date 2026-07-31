import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { getDrinksApi, createDrinkApi, editDrinkApi, deleteDrinkApi } from '../api/drinksAPI';
import type { DrinkItem, GetDrinksRequest, CreateDrinkRequest, EditDrinkRequest } from '../types';

// Default pagination parameters
const DEFAULT_PARAMS: GetDrinksRequest = {
  page: 1,
  size: 10,
  search: '',
  sortBy: 'drinkName',
  sortDirection: 'ASC',
};

// Custom hook for managing drinks data and operations
export function useDrinks(initialPage = 1, initialSize = 10) {
  const toast = useToast();
  const { t } = useTranslation();

  // Query parameters state
  const [params, setParams] = useState<GetDrinksRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  // API response data states
  const [items, setItems] = useState<DrinkItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);

  // UI loading states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  // Core data fetching function
  const fetchDrinks = useCallback(
    async (currentParams: GetDrinksRequest, isSearchAction = false) => {
      setLoading(true);
      if (isSearchAction) setSearchLoading(true);

      try {
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

  // Auto fetch data when params or search mode change
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

  // Handler for creating a new drink
  const createDrink = useCallback(
    async (values: CreateDrinkRequest) => {
      setCreateLoading(true);
      try {
        await createDrinkApi(values);
        toast.success(t('drinks.createSuccess') || 'Thêm đồ uống thành công!');
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

  // Handler for editing an existing drink
  const editDrink = useCallback(
    async (values: EditDrinkRequest) => {
      setEditLoading(true);
      try {
        await editDrinkApi(values);
        toast.success(t('drinks.editSuccess') || 'Cập nhật đồ uống thành công!');
        await fetchDrinks(params);
      } catch (error) {
        console.error('Failed to edit drink:', error);
        toast.error(t('drinks.editError') || 'Cập nhật đồ uống thất bại!');
        throw error;
      } finally {
        setEditLoading(false);
      }
    },
    [params, fetchDrinks, toast, t],
  );

  // Handler for deleting a drink
  const deleteDrink = useCallback(
    async (drinkId: string) => {
      setDeleteLoading(true);
      try {
        await deleteDrinkApi({ drinkId });
        toast.success(t('drinks.deleteSuccess') || 'Xoá đồ uống thành công!');
        await fetchDrinks(params);
      } catch (error) {
        console.error('Failed to delete drink:', error);
        toast.error(t('drinks.deleteError') || 'Xoá đồ uống thất bại!');
      } finally {
        setDeleteLoading(false);
      }
    },
    [params, fetchDrinks, toast, t],
  );

  // Handle keyword search
  const handleSearch = (searchKeyword: string) => {
    setIsSearch(true);
    setParams((prev) => ({
      ...prev,
      search: searchKeyword.trim(),
      page: 1,
    }));
  };

  // Handle page navigation
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
    editLoading,
    deleteLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handlePageChange,
    createDrink,
    editDrink,
    deleteDrink,
    refresh: () => fetchDrinks(params, false),
  };
}
