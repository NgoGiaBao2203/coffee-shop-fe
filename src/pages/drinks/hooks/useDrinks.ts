import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { getDrinksApi, createDrinkApi, deleteDrinkApi } from '../api/drinksAPI';
import { getShopNamesApi } from '@/pages/staffs/api/staffsApi';
import type { DrinkItem, GetDrinksRequest, CreateDrinkRequest } from '../types';
import type { ShopNameItem } from '@/pages/staffs/types';

// Default pagination, search, and shop filter parameters
const DEFAULT_PARAMS: GetDrinksRequest = {
  page: 1,
  size: 10,
  branchShopId: '',
  search: '',
  sortBy: 'drinkName',
  sortDirection: 'ASC',
};

// Custom hook managing drinks listing, filtering, and CRUD state
export function useDrinks(initialPage = 1, initialSize = 10) {
  const toast = useToast();
  const { t } = useTranslation();

  // Query parameters state
  const [params, setParams] = useState<GetDrinksRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  // Data states
  const [items, setItems] = useState<DrinkItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [shopNames, setShopNames] = useState<ShopNameItem[]>([]);

  // UI loading and status states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  // Core API request function
  const fetchDrinks = useCallback(
    async (currentParams: GetDrinksRequest, isSearchAction = false) => {
      setLoading(true);
      if (isSearchAction) setSearchLoading(true);

      try {
        const payload: GetDrinksRequest = {
          page: currentParams.page,
          size: currentParams.size,
          branchShopId: currentParams.branchShopId || '',
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

  // Fetch shop list for the OWNER filter dropdown
  useEffect(() => {
    async function fetchOptions() {
      setOptionsLoading(true);
      try {
        const shopNamesRes = await getShopNamesApi();
        setShopNames(shopNamesRes.shopNameResults || []);
      } catch (err) {
        console.error('Failed to fetch shop options:', err);
      } finally {
        setOptionsLoading(false);
      }
    }
    void fetchOptions();
  }, []);

  // Synchronize data fetching on parameter changes
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

  // Handler for deleting a drink
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

  // Handler for search keyword changes
  const handleSearch = (searchKeyword: string) => {
    setIsSearch(true);
    setParams((prev) => ({
      ...prev,
      search: searchKeyword.trim(),
      page: 1,
    }));
  };

  // Handler for shop filter changes
  const handleShopFilter = (branchShopId: string) => {
    setIsSearch(false);
    setParams((prev) => ({
      ...prev,
      branchShopId,
      page: 1,
    }));
  };

  // Handler for pagination changes
  const handlePageChange = (page: number, size?: number) => {
    setIsSearch(false);
    setParams((prev) => ({
      ...prev,
      page,
      size: size ?? prev.size,
    }));
  };

  // Map shop list to Ant Design Select options
  const shopOptions = shopNames.map((s) => ({
    value: s.shopId,
    label: s.shopName,
  }));

  return {
    items,
    totalElements,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search ?? '',
    currentBranchShopId: params.branchShopId,
    loading,
    searchLoading,
    createLoading,
    deleteLoading,
    optionsLoading,
    shopOptions,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handleShopFilter,
    handlePageChange,
    createDrink,
    deleteDrink,
    refresh: () => fetchDrinks(params, false),
  };
}
