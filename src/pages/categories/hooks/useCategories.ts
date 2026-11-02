import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getCategoriesApi,
  createCategoryApi,
  editCategoryApi,
  deleteCategoryApi,
} from '../api/categoriesApi';
import { useShopOptions } from '@/hooks/useShopOptions';
import { useToast } from '@/components/toast/useToast';
import type { PaginationInfo } from '@/types/api';
import { isApiReloadError } from '@/utils/apiError';
import type { CategoryItem, CategoryListParams } from '../types';
import type { CategoryCreateValues } from '../components/CategoryCreateModal';
import type { CategoryEditValues } from '../components/CategoryEditModal';

const DEFAULT_PARAMS: CategoryListParams = {
  page: 1,
  size: 10,
  shopId: '',
  search: '',
  // Default sortBy
  sortBy: 'drinkCategoryId',
  sortDirection: 'ASC',
};

export function useCategories() {
  const toast = useToast();
  const { t } = useTranslation();
  const [params, setParams] = useState<CategoryListParams>(DEFAULT_PARAMS);
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { shopOptions, optionsLoading } = useShopOptions();

  const fetchCategories = useCallback(
    async (currentParams: CategoryListParams, isSearch = false) => {
      setLoading(true);
      if (isSearch) setSearchLoading(true);
      try {
        const response = await getCategoriesApi(currentParams);
        setItems(response.items);
        setPagination(response.pagination);
        if (currentParams.search.trim() && response.items.length === 0) {
          setShowEmptyModal(true);
        }
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [],
  );

  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories(params, isSearch);
  }, [params, fetchCategories, isSearch]);

  const handleSearch = (search: string) => {
    setIsSearch(true);
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleShopFilter = (shopId: string) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, shopId, page: 1 }));
  };

  const handlePageChange = (page: number, size: number) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, page, size }));
  };

  const createCategory = useCallback(
    async (values: CategoryCreateValues) => {
      setCreateLoading(true);
      try {
        await createCategoryApi(values);
        toast.success(t('categories.createSuccess'));
        await fetchCategories(params);
      } finally {
        // Errors are shown on the form by the modal
        setCreateLoading(false);
      }
    },
    [params, fetchCategories, t, toast],
  );

  const editCategory = useCallback(
    async (categoryId: string, values: CategoryEditValues) => {
      setEditLoading(true);
      try {
        await editCategoryApi({ categoryId, ...values });
        toast.success(t('categories.editSuccess'));
        await fetchCategories(params);
      } catch (error) {
        if (isApiReloadError(error)) await fetchCategories(params);
        throw error;
      } finally {
        setEditLoading(false);
      }
    },
    [params, fetchCategories, t, toast],
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      setDeleteLoading(true);
      try {
        await deleteCategoryApi({ categoryId });
        toast.success(t('categories.deleteSuccess'));
        const isLastItemOnPage = items.length === 1 && params.page > 1;
        if (isLastItemOnPage) {
          setParams((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          await fetchCategories(params);
        }
      } catch (error) {
        // The interceptor already shows the error message
        if (isApiReloadError(error)) await fetchCategories(params);
      } finally {
        setDeleteLoading(false);
      }
    },
    [params, fetchCategories, items.length, t, toast],
  );

  return {
    items,
    pagination,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search,
    currentShopId: params.shopId,
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handleShopFilter,
    handlePageChange,
    createCategory,
    createLoading,
    editCategory,
    editLoading,
    deleteCategory,
    deleteLoading,
    shopOptions,
    optionsLoading,
  };
}
