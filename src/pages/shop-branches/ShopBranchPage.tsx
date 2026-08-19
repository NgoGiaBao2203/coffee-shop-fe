import { useState, useEffect } from 'react';
import { Typography, Button, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TableGrid, type AppColumnType } from '@/components/table/TableGrid';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { AppFormDrawer, type FormFieldConfig } from '@/components/form/AppFormDrawer';
import { useShopBranch } from './hooks/useShopBranch';
import { createShopBranchApi, editShopBranchApi } from './api/shopBranchAPI';
import { ShopBranchCreateModal } from './components/ShopBranchCreateModal';
import { ShopBranchEditModal } from './components/ShopBranchEditModal';
import type { ShopBranchItem, CreateShopBranchRequest, EditShopBranchRequest } from './types';

// Format datetime values to Vietnamese locale string
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

export function ShopBranchPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();
  const { confirm: confirmDelete } = useConfirmModal();

  // Custom hook managing shop branch data, pagination, and search queries
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
    handleSearch,
    handlePageChange,
    refresh,
  } = useShopBranch(1, 10);

  // Drawer, modal, and record state
  const [detailOpen, setDetailOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<ShopBranchItem | null>(null);

  // Trigger error notification modal when search query yields no results
  useEffect(() => {
    if (showEmptyModal) {
      showError(t('table.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal, closeEmptyModal, showError, t]);

  // Form field configuration for the details drawer
  const branchFields: FormFieldConfig[] = [
    { name: 'shopName', label: t('shopBranches.shopName'), type: 'text', readOnly: true },
    { name: 'phoneNumber', label: t('shopBranches.phoneNumber'), type: 'text', readOnly: true },
    { name: 'address', label: t('shopBranches.address'), type: 'text', readOnly: true },
    { name: 'createdAt', label: t('shopBranches.createdAt'), readOnly: true, render: formatDate },
    { name: 'updatedAt', label: t('shopBranches.updatedAt'), readOnly: true, render: formatDate },
  ];

  // Table column definitions
  const columns: AppColumnType<ShopBranchItem>[] = [
    {
      key: 'shopName',
      dataIndex: 'shopName',
      title: t('shopBranches.shopName'),
      width: 220,
    },
    {
      key: 'phoneNumber',
      dataIndex: 'phoneNumber',
      title: t('shopBranches.phoneNumber'),
      width: 160,
      render: (val: string) => val || '—',
    },
    {
      key: 'address',
      dataIndex: 'address',
      title: t('shopBranches.address'),
      width: 300,
      render: (val: string) => val || '—',
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: t('shopBranches.createdAt'),
      width: 180,
      render: formatDate,
    },
    {
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      title: t('shopBranches.updatedAt'),
      width: 180,
      render: formatDate,
    },
  ];

  // Handle open create modal
  const handleCreateClick = () => {
    setCreateModalOpen(true);
  };

  // Handle create branch API submission
  const handleCreateSubmit = async (values: CreateShopBranchRequest) => {
    setCreateLoading(true);
    try {
      await createShopBranchApi(values);
      notification.success({
        message: t('shopBranches.createSuccess'),
        placement: 'topRight',
        duration: 3,
      });
      refresh();
      setCreateModalOpen(false);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle edit action on table row
  const handleEditClick = (record: ShopBranchItem) => {
    setSelectedRecord(record);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (values: EditShopBranchRequest) => {
    setEditLoading(true);
    try {
      await editShopBranchApi(values);
      notification.success({
        message: t('shopBranches.editSuccess'),
        placement: 'topRight',
        duration: 3,
      });
      refresh();
      setEditModalOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (record: ShopBranchItem) => {
    confirmDelete({
      title: t('table.deleteConfirmTitle'),
      content: t('table.deleteConfirmDesc'),
      okText: t('table.deleteOk'),
      cancelText: t('table.deleteCancel'),
      okDanger: true,
      onConfirm: async () => {
        // TODO: Trigger delete API endpoint once available
        console.log('Delete shop branch:', record.shopId);
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('sidebar.branchShops')}
      </Typography.Title>

      {/* Action Bar: Search input and Create button */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={handleSearch}
            loading={searchLoading}
            placeholder={t('shopBranches.searchPlaceholder')}
          />
        </div>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClick}>
          {t('form.create')}
        </Button>
      </div>

      {/* Table grid with built-in actions column (Edit & Delete) */}
      <TableGrid<ShopBranchItem>
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
        onEdit={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Read-only details drawer */}
      <AppFormDrawer<ShopBranchItem>
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        record={selectedRecord}
        fields={branchFields}
      />

      {/* Create Modal */}
      <ShopBranchCreateModal
        open={createModalOpen}
        loading={createLoading}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <ShopBranchEditModal
        open={editModalOpen}
        loading={editLoading}
        record={selectedRecord}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
