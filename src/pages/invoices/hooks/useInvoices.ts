import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getInvoicesApi, editInvoiceApi, updateInvoiceStatusApi } from '../api/invoicesAPI';
import { useShopOptions } from '@/hooks/useShopOptions';
import { useToast } from '@/components/toast/useToast';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import type { PaginationInfo } from '@/types/api';
import { isApiReloadError } from '@/utils/apiError';
import {
  INVOICE_STATUS,
  INVOICE_STATUS_NAME,
  type InvoiceItem,
  type InvoiceListParams,
  type EditInvoiceRequest,
} from '../types';

const DEFAULT_PARAMS: InvoiceListParams = {
  page: 1,
  size: 10,
  shopId: '',
  status: '',
  search: '',
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

export function useInvoices() {
  const toast = useToast();
  const { t } = useTranslation();
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const profileFullName = useAppSelector((state) => state.auth.profile?.fullName);
  const isOwner = roleName === ROLES.OWNER;
  const isStaff = roleName === ROLES.STAFF;

  const [params, setParams] = useState<InvoiceListParams>(DEFAULT_PARAMS);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  const [editLoading, setEditLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Only OWNER filters invoices by shop
  const { shopOptions, optionsLoading } = useShopOptions(isOwner);
  const [isSearch, setIsSearch] = useState(false);

  const fetchInvoices = useCallback(
    async (currentParams: InvoiceListParams, isSearching = false) => {
      setLoading(true);
      if (isSearching) setSearchLoading(true);
      try {
        const response = await getInvoicesApi(currentParams);
        const invoiceList = response?.items ?? [];
        setItems(invoiceList);
        setPagination(response?.pagination ?? null);

        if (currentParams.search.trim() && invoiceList.length === 0) {
          setShowEmptyModal(true);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices(params, isSearch);
  }, [params, fetchInvoices, isSearch]);

  const handleSearch = (search: string) => {
    setIsSearch(true);
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleShopFilter = (shopId: string) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, shopId: shopId || undefined, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, status: status || undefined, page: 1 }));
  };

  const handlePageChange = (page: number, size: number) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, page, size }));
  };

  const editInvoice = useCallback(
    async (values: EditInvoiceRequest) => {
      setEditLoading(true);
      try {
        await editInvoiceApi(values);
        toast.success(t('invoices.editSuccess'));
        await fetchInvoices(params);
      } catch (error) {
        // The message is shown by the edit modal (order editor)
        if (isApiReloadError(error)) await fetchInvoices(params);
        throw error;
      } finally {
        setEditLoading(false);
      }
    },
    [params, fetchInvoices, t, toast],
  );

  const payInvoice = useCallback(
    async (invoiceId: string) => {
      setPayLoading(true);
      try {
        await updateInvoiceStatusApi({ invoiceId, status: INVOICE_STATUS.COMPLETED });
        toast.success(t('invoices.paySuccess'));
        await fetchInvoices(params);
      } catch (error) {
        // The interceptor already shows the error message
        if (isApiReloadError(error)) await fetchInvoices(params);
      } finally {
        setPayLoading(false);
      }
    },
    [params, fetchInvoices, t, toast],
  );

  const cancelInvoice = useCallback(
    async (invoiceId: string) => {
      setCancelLoading(true);
      try {
        await updateInvoiceStatusApi({ invoiceId, status: INVOICE_STATUS.CANCELLED });
        toast.success(t('invoices.cancelSuccess'));
        await fetchInvoices(params);
      } catch (error) {
        if (isApiReloadError(error)) await fetchInvoices(params);
      } finally {
        setCancelLoading(false);
      }
    },
    [params, fetchInvoices, t, toast],
  );

  // Edit / pay / cancel only for PENDING invoices; STAFF only on invoices they created
  // (the list has no staff id, so compare the names; the backend still enforces it)
  const canManageInvoice = (record: InvoiceItem) =>
    record.status === INVOICE_STATUS_NAME.PENDING &&
    (!isStaff || (!!profileFullName && record.staffName === profileFullName));

  return {
    items,
    pagination,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search,
    currentShopId: params.shopId,
    currentStatus: params.status,
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handleShopFilter,
    handleStatusFilter,
    handlePageChange,
    editInvoice,
    editLoading,
    payInvoice,
    payLoading,
    cancelInvoice,
    cancelLoading,
    shopOptions,
    optionsLoading,
    canManageInvoice,
  };
}
