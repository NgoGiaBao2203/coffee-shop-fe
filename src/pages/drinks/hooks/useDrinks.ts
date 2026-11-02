import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { getDropdownCategoriesApi } from '@/api/dropdownApi';
import { useShopOptions } from '@/hooks/useShopOptions';
import { ROLES } from '@/permission/roles';
import { useAppSelector } from '@/store/hooks';
import { isApiReloadError } from '@/utils/apiError';
import { getDrinksApi, createDrinkApi, editDrinkApi, deleteDrinkApi } from '../api/drinksAPI';
import type {
  DrinkItem,
  GetDrinksRequest,
  CreateDrinkRequest,
  EditDrinkRequest,
  CategorySelectOption,
} from '../types';

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
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  // Dropdowns are OWNER / MANAGER only (STAFF only views the menu and creates orders)
  const canManageDrinks = roleName === ROLES.OWNER || roleName === ROLES.MANAGER;

  // Query parameters state
  const [params, setParams] = useState<GetDrinksRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  // Drink and dropdown data states
  const [items, setItems] = useState<DrinkItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const { shopOptions, optionsLoading: shopsLoading } = useShopOptions();
  const [categoryOptions, setCategoryOptions] = useState<CategorySelectOption[]>([]);

  // UI loading and status states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  // Fetch drinks using current pagination, search, and filter parameters
  const fetchDrinks = useCallback(
    async (currentParams: GetDrinksRequest, isSearchAction = false) => {
      setLoading(true);

      if (isSearchAction) {
        setSearchLoading(true);
      }

      try {
        // Normalize request payload before calling API
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

        // Update drink list and pagination total
        setItems(resItems);
        setTotalElements(response.pagination?.totalElements ?? resItems.length ?? 0);

        // Show empty result modal only for search actions
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

  // Fetch categories for the create / edit drink forms
  useEffect(() => {
    if (!canManageDrinks) return;

    async function fetchCategories() {
      setCategoriesLoading(true);

      try {
        const categoriesRes = await getDropdownCategoriesApi();

        // Map category response to Ant Design Select options
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
        setCategoriesLoading(false);
      }
    }

    void fetchCategories();
  }, [canManageDrinks]);

  // Reload drink list when query parameters change
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

  // Create a new drink
  const createDrink = useCallback(
    async (values: CreateDrinkRequest, imageFile?: File) => {
      setCreateLoading(true);

      try {
        await createDrinkApi(values, imageFile);
        toast.success(t('drinks.createSuccess'));

        // Refresh drink list after successful creation
        await fetchDrinks(params);
      } finally {
        // Errors are shown on the form by the modal
        setCreateLoading(false);
      }
    },
    [params, fetchDrinks, toast, t],
  );

  // Update an existing drink
  const editDrink = useCallback(
    async (values: EditDrinkRequest, imageFile?: File) => {
      setEditLoading(true);

      try {
        await editDrinkApi(values, imageFile);
        toast.success(t('drinks.editSuccess'));

        // Refresh drink list after successful update
        await fetchDrinks(params);
      } catch (error) {
        // Errors are shown on the form by the modal
        if (isApiReloadError(error)) await fetchDrinks(params);
        throw error;
      } finally {
        setEditLoading(false);
      }
    },
    [params, fetchDrinks, toast, t],
  );

  // Delete an existing drink
  const deleteDrink = useCallback(
    async (drinkId: string) => {
      setDeleteLoading(true);

      try {
        await deleteDrinkApi({ drinkId });
        toast.success(t('drinks.deleteSuccess'));

        // Refresh drink list after successful deletion
        await fetchDrinks(params);
      } catch (error) {
        // The interceptor already shows the error message
        if (isApiReloadError(error)) await fetchDrinks(params);
      } finally {
        setDeleteLoading(false);
      }
    },
    [params, fetchDrinks, toast, t],
  );

  // Update search keyword and reset to first page
  const handleSearch = (searchKeyword: string) => {
    setIsSearch(true);

    setParams((prev) => ({
      ...prev,
      search: searchKeyword.trim(),
      page: 1,
    }));
  };

  // Update shop filter and reset to first page
  const handleShopFilter = (shopId: string) => {
    setIsSearch(false);

    setParams((prev) => ({
      ...prev,
      shopId,
      page: 1,
    }));
  };

  // Update pagination parameters
  const handlePageChange = (page: number, size?: number) => {
    setIsSearch(false);

    setParams((prev) => ({
      ...prev,
      page,
      size: size ?? prev.size,
    }));
  };

  const optionsLoading = shopsLoading || categoriesLoading;

  // Expose drink data, actions, filters, and loading states
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
