import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getStaffsApi, editStaffApi, deleteStaffApi, createStaffApi } from '../api/staffsApi';
import { getRolesApi } from '@/api/dropdownApi';
import { useShopOptions } from '@/hooks/useShopOptions';
import { useToast } from '@/components/toast/useToast';
import type { PaginationInfo } from '@/types/api';
import type { RoleItem } from '@/types/dropdown';
import { isApiReloadError } from '@/utils/apiError';
import type { StaffItem, StaffListParams } from '../types';
import type { StaffEditValues } from '../components/StaffEditModal';
import type { StaffCreateValues } from '../components/StaffCreateModal';

const DEFAULT_PARAMS: StaffListParams = {
  page: 1,
  size: 10,
  roleId: '',
  branchShopId: '',
  search: '',
  sortBy: 'profileId',
  sortDirection: 'ASC',
};

export function useStaffs() {
  const toast = useToast();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialShopId = searchParams.get('shopId') ?? '';
  const [params, setParams] = useState<StaffListParams>({
    ...DEFAULT_PARAMS,
    branchShopId: initialShopId,
  });
  const [items, setItems] = useState<StaffItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const { shopOptions, optionsLoading: shopsLoading } = useShopOptions();

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
    async function fetchRoles() {
      setRolesLoading(true);
      try {
        const rolesRes = await getRolesApi();
        setRoles(rolesRes.roleResult ?? []);
      } finally {
        setRolesLoading(false);
      }
    }
    fetchRoles();
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

  const handleRoleFilter = (roleId: string) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, roleId, page: 1 }));
  };

  const handleShopFilter = (branchShopId: string) => {
    setIsSearch(false);
    setParams((prev) => ({ ...prev, branchShopId, page: 1 }));
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
        // Errors are shown on the form by the modal
        if (isApiReloadError(error)) await fetchStaffs(params);
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
        const isLastItemOnPage = items.length === 1 && params.page > 1;
        if (isLastItemOnPage) {
          setParams((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          await fetchStaffs(params);
        }
      } catch (error) {
        // The interceptor already shows the error message
        if (isApiReloadError(error)) await fetchStaffs(params);
      } finally {
        setDeleteLoading(false);
      }
    },
    [params, fetchStaffs, items.length], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const createStaff = useCallback(
    async (values: StaffCreateValues) => {
      setCreateLoading(true);
      try {
        await createStaffApi(values);
        toast.success(t('staffs.createSuccess'));
        await fetchStaffs(params);
      } finally {
        // Errors are shown on the form by the modal
        setCreateLoading(false);
      }
    },
    [params, fetchStaffs], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const roleOptions = roles.map((r) => ({ value: r.roleId, label: r.roleDisplayName }));
  const optionsLoading = rolesLoading || shopsLoading;

  return {
    items,
    pagination,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search,
    currentRoleId: params.roleId,
    currentBranchShopId: params.branchShopId,
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handleRoleFilter,
    handleShopFilter,
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
