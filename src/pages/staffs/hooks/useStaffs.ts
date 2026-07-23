import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  getStaffsApi,
  editStaffApi,
  deleteStaffApi,
  createStaffApi,
  getRolesApi,
  getShopNamesApi,
} from '../api/staffsApi';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';
import { useToast } from '@/components/toast/useToast';
import type { StaffItem, StaffListParams, PaginationInfo, RoleItem, ShopNameItem } from '../types';
import type { StaffEditValues } from '../components/StaffEditModal';
import type { StaffCreateValues } from '../components/StaffCreateModal';

const DEFAULT_PARAMS: StaffListParams = {
  page: 1,
  size: 10,
  search: '',
  sortBy: 'profileId',
  sortDirection: 'ASC',
};

export function useStaffs() {
  const toast = useToast();
  const { t } = useTranslation();
  const [params, setParams] = useState<StaffListParams>(DEFAULT_PARAMS);
  const [items, setItems] = useState<StaffItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [shopNames, setShopNames] = useState<ShopNameItem[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

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

  useEffect(() => {
    async function fetchOptions() {
      setOptionsLoading(true);
      try {
        const [rolesRes, shopNamesRes] = await Promise.all([getRolesApi(), getShopNamesApi()]);
        setRoles(rolesRes.roleResult);
        setShopNames(shopNamesRes.shopNameResults);
      } finally {
        setOptionsLoading(false);
      }
    }
    fetchOptions();
  }, []);

  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const editStaff = useCallback(
    async (profileId: string, values: StaffEditValues) => {
      setEditLoading(true);
      try {
        await editStaffApi({ profileId, ...values });
        toast.success(t('staffs.editSuccess'));
        await fetchStaffs(params);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
        throw error;
      } finally {
        setEditLoading(false);
      }
    },
    [params, fetchStaffs], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const deleteStaff = useCallback(
    async (profileId: string) => {
      setDeleteLoading(true);
      try {
        await deleteStaffApi({ profileId });
        toast.success(t('staffs.deleteSuccess'));
        await fetchStaffs(params);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
      } finally {
        setDeleteLoading(false);
      }
    },
    [params, fetchStaffs], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const createStaff = useCallback(
    async (values: StaffCreateValues) => {
      setCreateLoading(true);
      try {
        await createStaffApi(values);
        toast.success(t('staffs.createSuccess'));
        await fetchStaffs(params);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.code === RESPONSE_CODE.NOT_FOUND) {
          toast.error(getResponseMessage(RESPONSE_CODE.NOT_FOUND));
        }
        throw error;
      } finally {
        setCreateLoading(false);
      }
    },
    [params, fetchStaffs], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const roleOptions = roles.map((r) => ({ value: r.roleId, label: r.roleDisplayName }));
  const shopOptions = shopNames.map((s) => ({ value: s.shopId, label: s.shopName }));

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
    editStaff,
    editLoading,
    createStaff,
    createLoading,
    deleteStaff,
    deleteLoading,
    roleOptions,
    shopOptions,
    optionsLoading,
  };
}
