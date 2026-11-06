import { useState, useEffect, useMemo } from 'react';
import type { Dayjs } from 'dayjs';
import { useShopOptions } from '@/hooks/useShopOptions';
import { getRevenuesApi } from '../api/revenuesAPI';
import { toDateRange, type FilterType } from '../utils';
import type { RevenueResult, GetRevenuesRequest, PaginationInfo } from '../types';

// Invoice built from the drink lines (items) that share the same invoiceId
export interface GroupedInvoice {
  invoiceId: string;
  invoiceCode: string;
  shopId: string;
  shopName: string;
  fullName: string;
  createdAt: string;
  totalAmount: number;
  tableNumber: number | null;
  items: {
    drinkName: string;
    size: string;
    quantity: number;
    price: number;
    note: string | null;
  }[];
}

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
  const [rawItems, setRawItems] = useState<RevenueResult[]>([]);
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
        setRawItems(response.items ?? []);
        setPagination(response.pagination ?? null);
        setTotalRevenue(response.totalRevenue ?? 0);
        setTotalInvoices(response.totalInvoices ?? 0);
        if (params.search?.trim() && response.items?.length === 0) {
          setShowEmptyModal(true);
        }
      } catch {
        // The api interceptor already shows the error notification
        if (isMounted) {
          setRawItems([]);
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

  const groupedInvoices = useMemo(() => {
    const map = new Map<string, GroupedInvoice>();

    rawItems.forEach((item) => {
      let invoice = map.get(item.invoiceId);
      if (!invoice) {
        invoice = {
          invoiceId: item.invoiceId,
          invoiceCode: item.invoiceCode,
          shopId: item.shopId,
          shopName: item.shopName,
          fullName: item.fullName,
          createdAt: item.createdAt,
          totalAmount: item.totalAmount,
          tableNumber: item.tableNumber,
          items: [],
        };
        map.set(item.invoiceId, invoice);
      }
      invoice.items.push({
        drinkName: item.drinkName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        note: item.note,
      });
    });

    return Array.from(map.values());
  }, [rawItems]);

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
    groupedInvoices,
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
