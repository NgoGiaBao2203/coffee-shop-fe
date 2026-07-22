import { useState, useEffect, useCallback } from 'react';
import { getStaffsApi } from '../api/staffsApi';
import type { StaffItem, StaffListParams, PaginationInfo } from '../types';

const DEFAULT_PARAMS: StaffListParams = {
  page: 1,
  size: 10,
  search: '',
  sortBy: 'profileId',
  sortDirection: 'ASC',
};

export function useStaffs() {
  const [params, setParams] = useState<StaffListParams>(DEFAULT_PARAMS);
  const [items, setItems] = useState<StaffItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);

  const fetchStaffs = useCallback(async (currentParams: StaffListParams, isSearch = false) => {
    setLoading(true);
    if (isSearch) setSearchLoading(true);
    try {
      const response = await getStaffsApi(currentParams);
      setItems(response.items);
      setPagination(response.pagination);
      if (currentParams.search.trim() && response.items.length === 0) {
        setShowEmptyModal(true);
      }
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, []);

  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    fetchStaffs(params, isSearch);
  }, [params, fetchStaffs, isSearch]);

  const handleSearch = (search: string) => {
    setIsSearch(true);
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number, size: number) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, page, size }));
  };

  return {
    items,
    pagination,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search,
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handlePageChange,
  };
}
