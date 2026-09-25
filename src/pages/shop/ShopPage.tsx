import { useState, useEffect } from 'react';
import { Typography, Button, notification } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TableGrid, type AppColumnType } from '@/components/table/TableGrid';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { AppFormDrawer, type FormFieldConfig } from '@/components/form/AppFormDrawer';
import { useShop } from './hooks/useShop';
import { createShopApi, editShopApi, deleteShopApi } from './api/shopAPI';
import { ShopCreateModal } from './components/ShopCreateModal';
import { ShopEditModal } from './components/ShopEditModal';
import type { ShopItem, CreateShopRequest, EditShopRequest } from './types';

const SEARCH_PATTERN = /^[\p{L}0-9\s.,/&'#-]*$/u;
const SEARCH_MAX_LENGTH = 100;

const formatDate = (value: unknown) =>
  value
    ? new Date(value as string).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

export function ShopPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useNotifyModal();
  const { confirm: confirmDelete } = useConfirmModal();
  const {
    items,
    pagination,
    currentPage,
    currentPageSize,
    loading,
    searchLoading,
    searchKeyword,
    showEmptyModal,
    closeEmptyModal,
    handleSearch: triggerHookSearch,
    handlePageChange,
    refresh,
  } = useShop(1, 10);

  const [detailOpen, setDetailOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ShopItem | null>(null);

  useEffect(() => {
    if (showEmptyModal) {
      showError(t('table.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal, closeEmptyModal, showError, t]);

  const handleSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed.length > SEARCH_MAX_LENGTH) {
      showError(t('shops.nameMaxLength'), t('common.error'));
      return;
    }
    if (trimmed && !SEARCH_PATTERN.test(trimmed)) {
      showError(t('shops.specialCharacters'), t('common.error'));
      return;
    }
    triggerHookSearch(keyword);
  };

  const shopFields: FormFieldConfig[] = [
    { name: 'shopName', label: t('shops.shopName'), type: 'text', readOnly: true },
    { name: 'address', label: t('shops.address'), type: 'text', readOnly: true },
    { name: 'phoneNumber', label: t('shops.phoneNumber'), type: 'text', readOnly: true },
    {
      name: 'activeStaffCount',
      label: t('shops.activeStaffCount'),
      type: 'number',
      readOnly: true,
    },
    { name: 'createdAt', label: t('shops.createdAt'), readOnly: true, render: formatDate },
    { name: 'updatedAt', label: t('shops.updatedAt'), readOnly: true, render: formatDate },
  ];

  const columns: AppColumnType<ShopItem>[] = [
    {
      key: 'shopName',
      dataIndex: 'shopName',
      title: t('shops.shopName'),
      width: 260,
    },
    {
      key: 'address',
      dataIndex: 'address',
      title: t('shops.address'),
      width: 400,
      render: (value: string) => value || '—',
    },
    {
      key: 'phoneNumber',
      dataIndex: 'phoneNumber',
      title: t('shops.phoneNumber'),
      width: 160,
      render: (value: string | null) => value || '—',
    },
    {
      key: 'activeStaffCount',
      dataIndex: 'activeStaffCount',
      title: t('shops.activeStaffCount'),
      width: 160,
      render: (value: number) => value ?? 0,
    },
  ];

  const handleCreateSubmit = async (values: CreateShopRequest) => {
    setCreateLoading(true);
    try {
      await createShopApi(values);
      notification.success({
        message: t('shops.createSuccess'),
        placement: 'topRight',
        duration: 3,
      });
      refresh();
      setCreateModalOpen(false);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (values: EditShopRequest) => {
    if (!selectedRecord) return;
    setEditLoading(true);
    try {
      await editShopApi(selectedRecord.shopId, values);
      notification.success({
        message: t('shops.editSuccess'),
        placement: 'topRight',
        duration: 3,
      });
      refresh();
      setEditModalOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (record: ShopItem) => {
    confirmDelete({
      title: t('shops.deleteTitle'),
      content: t('shops.deleteConfirmDesc', { name: record.shopName }),
      okText: t('table.deleteOk'),
      cancelText: t('table.deleteCancel'),
      okDanger: true,
      onConfirm: async () => {
        try {
          await deleteShopApi({ shopId: record.shopId });
          notification.success({
            message: t('shops.deleteSuccess'),
            placement: 'topRight',
            duration: 3,
          });
          refresh();
        } catch (error) {
          const errMsg = axios.isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message || ''
            : '';
          const normalizedMessage = errMsg.toLowerCase();
          const hasActiveStaff = normalizedMessage.includes('active staff');
          const hasPendingInvoices = normalizedMessage.includes('pending invoices');

          if (hasActiveStaff && hasPendingInvoices) {
            showError(t('shops.deleteActiveStaffAndPendingInvoices'), t('common.error'));
          } else if (hasActiveStaff) {
            showError(t('shops.deleteActiveStaff'), t('common.error'));
          } else if (hasPendingInvoices) {
            showError(t('shops.deletePendingInvoices'), t('common.error'));
          } else {
            showError(t('responses.ER001'), t('common.error'));
          }
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('shops.title')}
      </Typography.Title>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={handleSearch}
            loading={searchLoading}
            placeholder={t('shops.searchPlaceholder')}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          {t('form.create')}
        </Button>
      </div>

      <TableGrid<ShopItem>
        rowKey="shopId"
        columns={columns}
        dataSource={items}
        loading={loading}
        emptyText={searchKeyword.trim() ? t('table.emptySearch') : t('table.emptyData')}
        total={pagination?.totalElements}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        onPageChange={handlePageChange}
        onRowClick={(record) => {
          setSelectedRecord(record);
          setDetailOpen(true);
        }}
        onEdit={(record) => {
          setSelectedRecord(record);
          setEditModalOpen(true);
        }}
        onDeleteClick={handleDeleteClick}
      />

      <AppFormDrawer<ShopItem>
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        record={selectedRecord}
        fields={shopFields}
        contentActions={
          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              icon={<TeamOutlined />}
              disabled={!selectedRecord}
              onClick={() => {
                if (!selectedRecord) return;
                navigate(`/staff?shopId=${encodeURIComponent(selectedRecord.shopId)}`);
                setDetailOpen(false);
              }}
            >
              {t('shops.viewStaff')}
            </Button>
          </div>
        }
      />

      <ShopCreateModal
        open={createModalOpen}
        loading={createLoading}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <ShopEditModal
        open={editModalOpen}
        loading={editLoading}
        record={selectedRecord}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
