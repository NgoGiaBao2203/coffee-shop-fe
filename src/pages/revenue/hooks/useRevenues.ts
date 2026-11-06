import { useState, useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import { useShopOptions } from '@/hooks/useShopOptions';
import { getRevenuesApi } from '../api/revenuesAPI';
import { toDateRange, type FilterType } from '../utils';
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

export function useRevenues() {
  const [params, setParams] = useState<GetRevenuesRequest>(DEFAULT_PARAMS);
  const [invoices, setInvoices] = useState<RevenueInvoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const { shopOptions, optionsLoading } = useShopOptions();

  const [filterType, setFilterType] = useState<FilterType>('DATE');
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
        setTotalInvoices(response.totalInvoices ?? 0);
        if (params.search?.trim() && response.items?.length === 0) {
          setShowEmptyModal(true);
        }
      } catch {
        // The api interceptor already shows the error notification
        if (isMounted) {
          setInvoices([]);
          setPagination(null);
          setTotalRevenue(0);
          setTotalInvoices(0);
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

  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type);
    setPickedDate(null);
  };

  // Nothing picked = no date filter
  const handleApplyFilter = () => {
    const range = pickedDate ? toDateRange(filterType, pickedDate) : {};
    setParams((prev) => ({ ...prev, startDate: undefined, endDate: undefined, ...range, page: 1 }));
  };

  const handleResetFilter = () => {
    setPickedDate(null);
    setFilterType('DATE');
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

  return {
    invoices,
    pagination,
    totalRevenue,
    totalInvoices,
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
    shopOptions,
    optionsLoading,
    filterType,
    pickedDate,
    setPickedDate,
    handleFilterTypeChange,
    handleApplyFilter,
    handleResetFilter,
  };
}
