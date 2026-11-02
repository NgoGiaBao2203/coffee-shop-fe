import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { useToast } from '@/components/toast/useToast';
import { useShopOptions } from '@/hooks/useShopOptions';
import { getInvoicesApi } from '@/pages/invoices/api/invoicesAPI';
import { INVOICE_STATUS } from '@/pages/invoices/types';
import type { PaginationInfo } from '@/types/api';
import { isApiReloadError } from '@/utils/apiError';
import { getTablesApi, createTableApi, editTableApi, deleteTableApi } from '../api/tablesApi';
import { TABLE_STATUS, type SearchTablesRequest, type TableItem } from '../types';
import type { TableCreateValues } from '../components/TableCreateModal';
import type { TableEditValues } from '../components/TableEditModal';

// True when the table still has an unpaid (PENDING) invoice
async function hasPendingInvoice(table: TableItem): Promise<boolean> {
  const response = await getInvoicesApi({
    page: 1,
    size: 100,
    shopId: table.shopId,
    status: String(INVOICE_STATUS.PENDING),
    search: String(table.tableNumber),
    sortBy: 'createdAt',
    sortDirection: 'DESC',
  });

  return (response.items ?? []).some((invoice) => invoice.tableId === table.tableId);
}

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
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);

  const [params, setParams] = useState<SearchTablesRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  const [items, setItems] = useState<TableItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { shopNames, shopOptions, optionsLoading } = useShopOptions();

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

      // MANAGER: the shop options only contain their own shop
      return shopNames[0]?.shopId ?? '';
    },
    [roleName, params.shopId, shopNames],
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
        // Freeing an occupied table that still has an unpaid invoice breaks paying / editing it
        const isLeavingOccupied =
          record.status === TABLE_STATUS.OCCUPIED && values.status !== TABLE_STATUS.OCCUPIED;
        if (isLeavingOccupied && (await hasPendingInvoice(record))) {
          toast.error(t('tables.occupiedHasPendingInvoice'));
          throw new Error('table has a pending invoice');
        }

        await editTableApi({
          tableId: record.tableId,
          tableNumber: values.tableNumber,
          description: values.description?.trim() || undefined,
          status: values.status,
          shopId,
        });
        toast.success(t('tables.editSuccess'));
        await fetchTables(params);
      } catch (error) {
        // Errors are shown on the form by the modal
        if (isApiReloadError(error)) await fetchTables(params);
        throw error;
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
        // The interceptor already shows the error message
        if (isApiReloadError(error)) await fetchTables(params);
        throw error;
      } finally {
        setDeleteLoading(false);
      }
    },
    [resolveShopId, fetchTables, params, items.length, toast, t],
  );

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
