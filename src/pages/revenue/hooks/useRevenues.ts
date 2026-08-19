import { useState, useEffect, useMemo } from 'react';
import { getRevenuesApi } from '../api/revenuesAPI';
import { getShopNamesApi } from '@/pages/staffs/api/staffsApi';
import type { RevenueResult, GetRevenuesRequest, PaginationInfo } from '../types';
import type { ShopNameItem } from '@/pages/staffs/types';

export type FilterType = 'DATE' | 'MONTH' | 'YEAR';

// Interface representing an invoice grouped by its unique ID with item details
export interface GroupedInvoice {
  invoiceId: string;
  shopId: string;
  shopName: string;
  fullName: string;
  createdAt: string;
  totalAmount: number;
  tableNumber: number;
  items: {
    drinkName: string;
    size: string;
    quantity: number;
    price: number;
    note: string | null;
  }[];
}

// Default request parameters for fetching revenue data
const DEFAULT_PARAMS: GetRevenuesRequest = {
  page: 1,
  size: 10,
  search: '',
  shopId: '',
  startDate: undefined,
  endDate: undefined,
  year: undefined,
  month: undefined,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
};

/**
 * Custom hook to manage state, filtering, grouping, and API interaction for revenues
 */
export function useRevenues() {
  const [params, setParams] = useState<GetRevenuesRequest>(DEFAULT_PARAMS);
  const [rawItems, setRawItems] = useState<RevenueResult[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [shopNames, setShopNames] = useState<ShopNameItem[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Filter States
  const [filterType, setFilterType] = useState<FilterType>('DATE');
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  // Fetch shop branch options for filtering
  useEffect(() => {
    let isMounted = true;

    const fetchShops = async () => {
      setOptionsLoading(true);
      try {
        const res = await getShopNamesApi();
        if (isMounted) {
          setShopNames(res.shopNameResults || []);
        }
      } catch (error) {
        console.error('Failed to fetch shop names:', error);
      } finally {
        if (isMounted) setOptionsLoading(false);
      }
    };

    fetchShops();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch revenue list data based on active parameters
  useEffect(() => {
    let isMounted = true;

    const fetchRevenuesData = async () => {
      setLoading(true);
      try {
        const response = await getRevenuesApi(params);
        if (isMounted) {
          setRawItems(response.items || []);
          setPagination(response.pagination || null);
          if (params.search?.trim() && response.items?.length === 0) {
            setShowEmptyModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch revenues:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setSearchLoading(false);
        }
      }
    };

    fetchRevenuesData();

    return () => {
      isMounted = false;
    };
  }, [params]);

  // Group raw itemized database records into unified invoices by invoiceId
  const groupedInvoices = useMemo(() => {
    const map = new Map<string, GroupedInvoice>();

    rawItems.forEach((item) => {
      if (!map.has(item.invoiceId)) {
        map.set(item.invoiceId, {
          invoiceId: item.invoiceId,
          shopId: item.shopId,
          shopName: item.shopName,
          fullName: item.fullName,
          createdAt: item.createdAt,
          totalAmount: item.totalAmount,
          tableNumber: item.tableNumber,
          items: [],
        });
      }

      const invoice = map.get(item.invoiceId)!;
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

  // Apply chosen filter criteria (Date, Month, or Year) to request parameters
  const handleApplyFilter = () => {
    setParams((prev) => {
      const newParams = { ...prev, page: 1 };
      if (filterType === 'DATE') {
        newParams.startDate = selectedDate;
        newParams.endDate = selectedDate;
        newParams.month = undefined;
        newParams.year = undefined;
      } else if (filterType === 'MONTH') {
        newParams.startDate = undefined;
        newParams.endDate = undefined;
        newParams.month = selectedMonth;
        newParams.year = selectedYear;
      } else if (filterType === 'YEAR') {
        newParams.startDate = undefined;
        newParams.endDate = undefined;
        newParams.month = undefined;
        newParams.year = selectedYear;
      }
      return newParams;
    });
  };

  // Reset all filters back to default values
  const handleResetFilter = () => {
    setSelectedDate(undefined);
    setSelectedMonth(undefined);
    setSelectedYear(undefined);
    setFilterType('DATE');
    setParams(DEFAULT_PARAMS);
  };

  // Handle keyword search input
  const handleSearch = (search: string) => {
    setSearchLoading(true);
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  // Filter revenue by selected shop ID
  const handleShopFilter = (shopId: string) => {
    setParams((prev) => ({ ...prev, shopId, page: 1 }));
  };

  // Handle pagination page and size changes
  const handlePageChange = (page: number, size: number) => {
    setParams((prev) => ({ ...prev, page, size }));
  };

  // Calculate aggregate total amount for all displayed grouped invoices
  const aggregatedTotalAmount = useMemo(() => {
    return groupedInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  }, [groupedInvoices]);

  // Format shop options for select dropdown
  const shopOptions = shopNames.map((s) => ({ value: s.shopId, label: s.shopName }));

  return {
    groupedInvoices,
    pagination,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search || '',
    currentShopId: params.shopId || '',
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handleShopFilter,
    handlePageChange,
    shopOptions,
    optionsLoading,
    aggregatedTotalAmount,
    filterType,
    setFilterType,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    handleApplyFilter,
    handleResetFilter,
  };
}
