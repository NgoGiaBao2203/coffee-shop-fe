import { useState, useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useShopOptions } from '@/hooks/useShopOptions';
import { useToast } from '@/components/toast/useToast';
import { downloadFile } from '@/utils/downloadFile';
import { exportRevenuesApi, getRevenuesApi } from '../api/revenuesAPI';
import { toDateRange, toExportFileName, type FilterType } from '../utils';
import type { RevenueInvoice, GetRevenuesRequest, PaginationInfo } from '../types';

const DEFAULT_PARAMS: GetRevenuesRequest = {
  page: 1,
  size: 10,
  search: '',
  shopId: '',
  startDate: undefined,
  endDate: undefined,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

// The page opens on every period, matching DEFAULT_PARAMS (no date filter)
const DEFAULT_FILTER_TYPE: FilterType = 'ALL';

export function useRevenues() {
  const { t } = useTranslation();
  const toast = useToast();
  const [params, setParams] = useState<GetRevenuesRequest>(DEFAULT_PARAMS);
  const [exportLoading, setExportLoading] = useState(false);
  const [invoices, setInvoices] = useState<RevenueInvoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const { shopOptions, optionsLoading } = useShopOptions();

  const [filterType, setFilterType] = useState<FilterType>(DEFAULT_FILTER_TYPE);
  const [pickedDate, setPickedDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRevenuesData = async () => {
      setLoading(true);
      try {
        const response = await getRevenuesApi(params);
        if (!isMounted) return;
        setInvoices(response.items ?? []);
        setPagination(response.pagination ?? null);
        setTotalRevenue(response.totalRevenue ?? 0);
        if (params.search?.trim() && response.items?.length === 0) {
          setShowEmptyModal(true);
        }
      } catch {
        // The api interceptor already shows the error notification
        if (isMounted) {
          setInvoices([]);
          setPagination(null);
          setTotalRevenue(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setSearchLoading(false);
        }
      }
    };

    void fetchRevenuesData();

    return () => {
      isMounted = false;
    };
  }, [params]);

  // Apply the period right away; no date = no date filter (skip the refetch if nothing changes)
  const applyDateFilter = (type: FilterType, date: Dayjs | null) => {
    const range = date && type !== 'ALL' ? toDateRange(type, date) : {};
    setParams((prev) =>
      !date && !prev.startDate && !prev.endDate
        ? prev
        : { ...prev, startDate: undefined, endDate: undefined, ...range, page: 1 },
    );
  };

  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type);
    setPickedDate(null);
    applyDateFilter(type, null);
  };

  const handlePickedDateChange = (date: Dayjs | null) => {
    setPickedDate(date);
    applyDateFilter(filterType, date);
  };

  const handleResetFilter = () => {
    setPickedDate(null);
    setFilterType(DEFAULT_FILTER_TYPE);
    setParams(DEFAULT_PARAMS);
  };

  const handleSearch = (search: string) => {
    setSearchLoading(true);
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleShopFilter = (shopId: string) => {
    setParams((prev) => ({ ...prev, shopId, page: 1 }));
  };

  const handlePageChange = (page: number, size: number) => {
    setParams((prev) => ({ ...prev, page, size }));
  };

  // "All time" exports everything; a day/week/month/year type needs its date picked first
  const canExport = filterType === 'ALL' || !!(params.startDate && params.endDate);

  // Export the filters currently applied to the table
  const handleExport = async () => {
    if (!canExport) return;
    setExportLoading(true);
    try {
      const file = await exportRevenuesApi(params);
      downloadFile(file, toExportFileName(params.startDate, params.endDate));
      toast.success(t('revenues.exportSuccess'));
    } catch {
      // The api interceptor already shows the error notification
    } finally {
      setExportLoading(false);
    }
  };

  return {
    invoices,
    pagination,
    totalRevenue,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search ?? '',
    currentShopId: params.shopId ?? '',
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handleShopFilter,
    handlePageChange,
    exportLoading,
    canExport,
    handleExport,
    shopOptions,
    optionsLoading,
    filterType,
    pickedDate,
    handlePickedDateChange,
    handleFilterTypeChange,
    handleResetFilter,
  };
}
