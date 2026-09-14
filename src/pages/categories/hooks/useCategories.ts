import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import {
  getCategoriesApi,
  getShopNamesApi,
  createCategoryApi,
  editCategoryApi,
  deleteCategoryApi,
} from '../api/categoriesApi';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import { useToast } from '@/components/toast/useToast';
import type { CategoryItem, CategoryListParams, PaginationInfo, ShopNameItem } from '../types';
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
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
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
      if (roleName !== ROLES.OWNER && roleName !== ROLES.MANAGER) return;

      setOptionsLoading(true);
      try {
        const shopNamesRes = await getShopNamesApi();
        setShopNames(shopNamesRes.shopNameResults);
      } finally {
        setOptionsLoading(false);
      }
    }
    fetchOptions();
  }, [roleName]);

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
        if (axios.isAxiosError(error) && error.response?.data) {
          const resData = error.response.data;

          if (resData.code === RESPONSE_CODE.NOT_FOUND || resData.code === 'ER004') {
            toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
          } else if (
            resData.code === RESPONSE_CODE.CONFLICT ||
            resData.code === 'ER005' ||
            resData.code === 'ER011'
          ) {
            toast.error(t('categories.nameConflict'));
          } else if (resData.code) {
            toast.error(getResponseMessage(resData.code));
          }
        }
        throw error;
      } finally {
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
        if (axios.isAxiosError(error) && error.response?.data) {
          const resData = error.response.data;

          if (resData.code === RESPONSE_CODE.NOT_FOUND || resData.code === 'ER004') {
            toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
          } else if (resData.code === RESPONSE_CODE.INVALID_REQUEST || resData.code === 'ER008') {
            const duplicateError = resData.errorDetails?.find(
              (err: { errorCode: string }) =>
                err.errorCode === RESPONSE_CODE.CONFLICT ||
                err.errorCode === 'ER005' ||
                err.errorCode === 'ER011',
            );

            if (duplicateError) {
              toast.error(t('categories.nameConflict'));
            } else if (resData.errorDetails?.[0]?.errorCode) {
              toast.error(getResponseMessage(resData.errorDetails[0].errorCode));
            } else {
              toast.error(getResponseMessage(RESPONSE_CODE.INVALID_REQUEST));
            }
          } else if (
            resData.code === RESPONSE_CODE.CONFLICT ||
            resData.code === 'ER005' ||
            resData.code === 'ER011'
          ) {
            toast.error(t('categories.nameConflict'));
          } else if (resData.code) {
            toast.error(getResponseMessage(resData.code));
          }
        }
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
        if (
          axios.isAxiosError(error) &&
          (error.response?.data?.code === RESPONSE_CODE.NOT_FOUND ||
            error.response?.data?.code === 'ER004')
        ) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        } else if (axios.isAxiosError(error) && error.response?.data?.code) {
          toast.error(getResponseMessage(error.response.data.code));
        }
      } finally {
        setDeleteLoading(false);
      }
    },
    [params, fetchCategories, items.length, t, toast],
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
