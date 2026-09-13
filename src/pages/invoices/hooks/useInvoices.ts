import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  getInvoicesApi,
  editInvoiceApi,
  payInvoiceApi,
  cancelInvoiceApi,
  getShopNamesApi,
} from '../api/invoicesAPI';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import { useToast } from '@/components/toast/useToast';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import type {
  InvoiceItem,
  InvoiceListParams,
  PaginationInfo,
  ShopNameItem,
  EditInvoiceRequest,
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
  const rawRoleName = useAppSelector((state) => state.auth.profile?.roleName) ?? '';

  // Match role for both 'OWNER' and 'CHỦ QUÁN'
  const isOwner =
    rawRoleName.toUpperCase() === 'OWNER' ||
    rawRoleName.trim().toLowerCase() === ROLES.OWNER.trim().toLowerCase();

  const [params, setParams] = useState<InvoiceListParams>(DEFAULT_PARAMS);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  const [editLoading, setEditLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [shopNames, setShopNames] = useState<ShopNameItem[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
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
    async function fetchShopOptions() {
      setOptionsLoading(true);
      try {
        const res = await getShopNamesApi();
        setShopNames(res?.shopNameResults ?? []);
      } catch {
        setShopNames([]);
      } finally {
        setOptionsLoading(false);
      }
    }

    if (isOwner) {
      fetchShopOptions();
    }
  }, [isOwner]);

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
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
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
        await payInvoiceApi({ invoiceId });
        toast.success(t('invoices.paySuccess'));
        await fetchInvoices(params);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
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
        await cancelInvoiceApi({ invoiceId });
        toast.success(t('invoices.cancelSuccess'));
        await fetchInvoices(params);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
      } finally {
        setCancelLoading(false);
      }
    },
    [params, fetchInvoices, t, toast],
  );

  const shopOptions = shopNames.map((s) => ({ value: s.shopId, label: s.shopName }));

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
  };
}
