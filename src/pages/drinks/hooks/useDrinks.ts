import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import {
  getDrinksApi,
  createDrinkApi,
  editDrinkApi,
  deleteDrinkApi,
  getDropdownCategoriesApi,
} from '../api/drinksAPI';
import { getShopNamesApi } from '@/pages/staffs/api/staffsApi';
import type {
  DrinkItem,
  GetDrinksRequest,
  CreateDrinkRequest,
  EditDrinkRequest,
  CategorySelectOption,
} from '../types';
import type { ShopNameItem } from '@/pages/staffs/types';

function showDrinkApiError(
  error: unknown,
  showError: (message: string) => void,
  t: (key: string) => string,
) {
  if (!axios.isAxiosError(error) || !error.response?.data) return;

  const response = error.response.data;
  const errorCode = response.code as string | undefined;

  const errorDetails: { errorCode?: string }[] = Array.isArray(response?.errorDetails)
    ? response.errorDetails
    : [];

  const isNameConflict =
    [RESPONSE_CODE.CONFLICT, 'ER011'].includes(errorCode ?? '') ||
    errorDetails.some(
      ({ errorCode: detailCode }) =>
        detailCode === RESPONSE_CODE.CONFLICT || detailCode === 'ER011',
    );

  if (isNameConflict) {
    showError(t('drinks.nameConflict'));
    return;
  }

  if (errorCode === RESPONSE_CODE.NOT_FOUND || errorCode === 'ER004') {
    showError(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
  } else if (errorCode === RESPONSE_CODE.INVALID_REQUEST || errorCode === 'ER008') {
    const firstDetailCode = errorDetails[0]?.errorCode;
    if (firstDetailCode === RESPONSE_CODE.PRICE_MIN) {
      showError(getResponseMessage(RESPONSE_CODE.PRICE_MIN));
    } else {
      showError(getResponseMessage(firstDetailCode || RESPONSE_CODE.INVALID_REQUEST));
    }
  } else if (errorCode) {
    showError(getResponseMessage(errorCode));
  }
}

// Default pagination, search, and shop filter parameters
const DEFAULT_PARAMS: GetDrinksRequest = {
  page: 1,
  size: 10,
  shopId: '',
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
  const [categoryOptions, setCategoryOptions] = useState<CategorySelectOption[]>([]);

  // UI loading and status states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
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
          shopId: currentParams.shopId || '',
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

  // Fetch shop list and categories for dropdown selections
  useEffect(() => {
    async function fetchOptions() {
      setOptionsLoading(true);
      try {
        const [shopNamesRes, categoriesRes] = await Promise.all([
          getShopNamesApi(),
          getDropdownCategoriesApi(),
        ]);
        setShopNames(shopNamesRes.shopNameResults || []);

        const mappedCategories: CategorySelectOption[] = (categoriesRes.categoryResult || []).map(
          (cat) => ({
            value: cat.categoryId,
            label: `${cat.shopName} - ${cat.categoryName}`,
            shopId: cat.shopId,
          }),
        );
        setCategoryOptions(mappedCategories);
      } catch (err) {
        console.error('Failed to fetch dropdown options:', err);
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
    async (values: CreateDrinkRequest, imageFile?: File) => {
      setCreateLoading(true);
      try {
        await createDrinkApi(values, imageFile);
        toast.success(t('drinks.createSuccess'));
        await fetchDrinks(params);
      } catch (error) {
        showDrinkApiError(error, toast.error, t);
        throw error;
      } finally {
        setCreateLoading(false);
      }
    },
    [params, fetchDrinks, toast, t],
  );

  // Handler for editing an existing drink
  const editDrink = useCallback(
    async (values: EditDrinkRequest, imageFile?: File) => {
      setEditLoading(true);
      try {
        await editDrinkApi(values, imageFile);
        toast.success(t('drinks.editSuccess'));
        await fetchDrinks(params);
      } catch (error) {
        showDrinkApiError(error, toast.error, t);
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
        toast.success(t('drinks.deleteSuccess'));
        await fetchDrinks(params);
      } catch (error) {
        showDrinkApiError(error, toast.error, t);
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
  const handleShopFilter = (shopId: string) => {
    setIsSearch(false);
    setParams((prev) => ({
      ...prev,
      shopId,
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
    currentShopId: params.shopId,
    loading,
    searchLoading,
    createLoading,
    editLoading,
    deleteLoading,
    optionsLoading,
    shopOptions,
    categoryOptions,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handleShopFilter,
    handlePageChange,
    createDrink,
    editDrink,
    deleteDrink,
    refresh: () => fetchDrinks(params, false),
  };
}
