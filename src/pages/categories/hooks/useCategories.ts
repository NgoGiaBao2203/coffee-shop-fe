import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  getCategoriesApi,
  createCategoryApi,
  editCategoryApi,
  deleteCategoryApi,
} from '../api/categoriesApi';
import { getShopNamesApi } from '@/pages/staffs/api/staffsApi';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import { useToast } from '@/components/toast/useToast';
import type { CategoryItem, CategoryListParams, PaginationInfo } from '../types';
import type { ShopNameItem } from '@/pages/staffs/types';
import type { CategoryCreateValues } from '../components/CategoryCreateModal';
import type { CategoryEditValues } from '../components/CategoryEditModal';

const DEFAULT_PARAMS: CategoryListParams = {
  page: 1,
  size: 10,
  branchShopId: '',
  search: '',
  sortBy: 'categoryId',
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
  const [shopNames, setShopNames] = useState<ShopNameItem[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

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

  useEffect(() => {
    async function fetchOptions() {
      setOptionsLoading(true);
      try {
        const shopNamesRes = await getShopNamesApi();
        setShopNames(shopNamesRes.shopNameResults);
      } finally {
        setOptionsLoading(false);
      }
    }
    fetchOptions();
  }, []);

  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories(params, isSearch);
  }, [params, fetchCategories, isSearch]);

  const handleSearch = (search: string) => {
    setIsSearch(true);
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleShopFilter = (branchShopId: string) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, branchShopId, page: 1 }));
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
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
        throw error;
      } finally {
        setCreateLoading(false);
      }
    },
    [params, fetchCategories], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const editCategory = useCallback(
    async (categoryId: string, values: CategoryEditValues) => {
      setEditLoading(true);
      try {
        await editCategoryApi({ categoryId, ...values });
        toast.success(t('categories.editSuccess'));
        await fetchCategories(params);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
        throw error;
      } finally {
        setEditLoading(false);
      }
    },
    [params, fetchCategories], // eslint-disable-line react-hooks/exhaustive-deps
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
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
      } finally {
        setDeleteLoading(false);
      }
    },
    [params, fetchCategories, items.length], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const shopOptions = shopNames.map((s) => ({ value: s.shopId, label: s.shopName }));

  return {
    items,
    pagination,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search,
    currentBranchShopId: params.branchShopId,
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
