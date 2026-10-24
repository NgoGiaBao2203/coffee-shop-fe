import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import { useToast } from '@/components/toast/useToast';
import { getShopNamesApi } from '@/pages/staffs/api/staffsApi';
import { getTablesApi, createTableApi, editTableApi, deleteTableApi } from '../api/tablesApi';
import type { SearchTablesRequest, TableItem, TablePagination, ShopNameItem } from '../types';
import type { TableCreateValues } from '../components/TableCreateModal';
import type { TableEditValues } from '../components/TableEditModal';

const DEFAULT_PARAMS: SearchTablesRequest = {
  page: 1,
  size: 10,
  search: '',
  sortBy: 'tableNumber',
  sortDirection: 'ASC',
};

export function useTables(initialPage = 1, initialSize = 10) {
  const toast = useToast();
  const { t } = useTranslation();
  const profile = useAppSelector((state) => state.auth.profile);
  const roleName = profile?.roleName;

  const [params, setParams] = useState<SearchTablesRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  const [items, setItems] = useState<TableItem[]>([]);
  const [pagination, setPagination] = useState<TablePagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [shopNames, setShopNames] = useState<ShopNameItem[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const fetchTables = useCallback(
    async (currentParams: SearchTablesRequest, isSearchAction = false) => {
      setLoading(true);
      if (isSearchAction) setSearchLoading(true);

      try {
        const payload: SearchTablesRequest = {
          page: currentParams.page,
          size: currentParams.size,
          search: currentParams.search?.trim() || undefined,
          status: currentParams.status,
          sortBy: currentParams.sortBy || 'tableNumber',
          sortDirection: currentParams.sortDirection || 'ASC',
          shopId: currentParams.shopId || undefined,
        };

        const response = await getTablesApi(payload);
        const resItems = response.items ?? [];

        setItems(resItems);
        setPagination(response.pagination ?? null);

        if (isSearchAction && currentParams.search?.trim() && resItems.length === 0) {
          setShowEmptyModal(true);
        }
      } catch (err) {
        console.error('Failed to fetch tables:', err);
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

  // Dropdown data: OWNER and MANAGER need the shop list
  useEffect(() => {
    async function fetchOptions() {
      if (roleName !== ROLES.OWNER && roleName !== ROLES.MANAGER) return;

      setOptionsLoading(true);
      try {
        const shopNamesRes = await getShopNamesApi();
        setShopNames(shopNamesRes.shopNameResults || []);
      } catch (err) {
        console.error('Failed to fetch shop names:', err);
      } finally {
        setOptionsLoading(false);
      }
    }
    void fetchOptions();
  }, [roleName]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchTables(params, isSearch);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [params, fetchTables, isSearch]);

  const resolveShopId = useCallback(
    (record?: TableItem): string => {
      if (record?.shopId) return record.shopId;
      if (roleName === ROLES.OWNER) return params.shopId ?? '';

      const profileShopId = (profile as { shopId?: string } | null)?.shopId;
      if (profileShopId) return profileShopId;

      const profileShopName = (profile?.shopName ?? '').trim().toLowerCase();
      return (
        shopNames.find((shop) => shop.shopName.trim().toLowerCase() === profileShopName)?.shopId ??
        ''
      );
    },
    [roleName, profile, params.shopId, shopNames],
  );

  const handleSearch = (search: string) => {
    setIsSearch(true);
    setParams((prev) => ({ ...prev, search: search.trim(), page: 1 }));
  };

  const handleStatusFilter = (status?: number) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleShopFilter = (shopId: string) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, shopId: shopId || undefined, page: 1 }));
  };

  const handlePageChange = (page: number, size?: number) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, page, size: size ?? prev.size }));
  };

  const createTable = useCallback(
    async (values: TableCreateValues) => {
      const shopId = values.shopId || resolveShopId();
      if (!shopId) {
        toast.error(t('tables.shopRequired'));
        throw new Error('shopId is required');
      }

      setCreateLoading(true);
      try {
        await createTableApi({
          tableNumber: values.tableNumber,
          description: values.description?.trim() || undefined,
          status: values.status,
          shopId,
        });
        toast.success(t('tables.createSuccess'));
        await fetchTables(params);
      } finally {
        setCreateLoading(false);
      }
    },
    [resolveShopId, fetchTables, params, toast, t],
  );

  const editTable = useCallback(
    async (record: TableItem, values: TableEditValues) => {
      if (!record.tableId) {
        throw new Error('tableId is required');
      }

      const shopId = record.shopId || values.shopId || resolveShopId(record);
      if (!shopId) {
        toast.error(t('tables.selectShopFirst'));
        throw new Error('shopId is required');
      }

      setEditLoading(true);
      try {
        await editTableApi({
          tableId: record.tableId,
          tableNumber: values.tableNumber,
          description: values.description?.trim() || undefined,
          status: values.status,
          shopId,
        });
        toast.success(t('tables.editSuccess'));
        await fetchTables(params);
      } finally {
        setEditLoading(false);
      }
    },
    [resolveShopId, fetchTables, params, toast, t],
  );

  const deleteTable = useCallback(
    async (record: TableItem) => {
      if (!record.tableId) {
        throw new Error('tableId is required');
      }

      const shopId = record.shopId || resolveShopId(record);
      if (!shopId) {
        toast.error(t('tables.selectShopFirst'));
        throw new Error('shopId is required');
      }

      setDeleteLoading(true);
      try {
        await deleteTableApi({ tableId: record.tableId, shopId });
        toast.success(t('tables.deleteSuccess'));

        const isLastItemOnPage = items.length === 1 && (params.page ?? 1) > 1;
        if (isLastItemOnPage) {
          setParams((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }));
        } else {
          await fetchTables(params);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
          const resData = error.response.data;
          const message = typeof resData.message === 'string' ? resData.message.toLowerCase() : '';

          if (resData.code === RESPONSE_CODE.NOT_FOUND || resData.code === 'ER004') {
            toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
          } else if (message.includes('pending invoices')) {
            toast.error(t('tables.deletePendingInvoices'));
          } else if (resData.code) {
            toast.error(getResponseMessage(resData.code));
          }
        }
        throw error;
      } finally {
        setDeleteLoading(false);
      }
    },
    [resolveShopId, fetchTables, params, items.length, toast, t],
  );

  const shopOptions = shopNames.map((shop) => ({ value: shop.shopId, label: shop.shopName }));

  return {
    items,
    pagination,
    totalElements: pagination?.totalElements ?? items.length,
    currentPage: params.page ?? 1,
    currentPageSize: params.size ?? 10,
    searchKeyword: params.search ?? '',
    currentStatus: params.status,
    currentShopId: params.shopId ?? '',
    loading,
    searchLoading,
    createLoading,
    editLoading,
    deleteLoading,
    optionsLoading,
    shopOptions,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handleStatusFilter,
    handleShopFilter,
    handlePageChange,
    createTable,
    editTable,
    deleteTable,
    refresh: () => fetchTables(params, false),
  };
}
