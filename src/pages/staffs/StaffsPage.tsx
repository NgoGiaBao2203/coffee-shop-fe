import { useEffect, useState } from 'react';
import { Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TableGrid, type AppColumnType } from '@/components/table/TableGrid';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { AppFormDrawer, type FormFieldConfig } from '@/components/form/AppFormDrawer';
import { StaffEditModal } from './components/StaffEditModal';
import { StaffCreateModal } from './components/StaffCreateModal';
import { useStaffs } from './hooks/useStaffs';
import type { StaffItem } from './types';

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

export function StaffsPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();
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
    editStaff,
    editLoading,
    createStaff,
    createLoading,
    deleteStaff,
    deleteLoading,
    roleOptions,
    shopOptions,
    optionsLoading,
  } = useStaffs();

  const { confirm: confirmDelete } = useConfirmModal();

  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StaffItem | null>(null);

  useEffect(() => {
    if (showEmptyModal) {
      showError(t('staffs.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal]); // eslint-disable-line react-hooks/exhaustive-deps

  const staffFields: FormFieldConfig[] = [
    { name: 'fullName', label: t('staffs.fullName'), type: 'text', rules: [{ required: true }] },
    { name: 'username', label: t('staffs.username'), type: 'text', readOnly: true },
    {
      name: 'email',
      label: t('staffs.email'),
      type: 'email',
      rules: [{ required: true, type: 'email' }],
    },
    { name: 'phoneNumber', label: t('staffs.phoneNumber'), type: 'text' },
    { name: 'roleName', label: t('staffs.role'), type: 'text', readOnly: true },
    { name: 'shopName', label: t('staffs.shopName'), type: 'text' },
    { name: 'createdAt', label: t('staffs.createdAt'), readOnly: true, render: formatDate },
    { name: 'updatedAt', label: t('staffs.updatedAt'), readOnly: true, render: formatDate },
  ];

  const columns: AppColumnType<StaffItem>[] = [
    {
      key: 'fullName',
      dataIndex: 'fullName',
      title: t('staffs.fullName'),
      width: 160,
      sorter: true,
    },
    {
      key: 'username',
      dataIndex: 'username',
      title: t('staffs.username'),
      width: 130,
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: t('staffs.email'),
      width: 210,
    },
    {
      key: 'phoneNumber',
      dataIndex: 'phoneNumber',
      title: t('staffs.phoneNumber'),
      width: 140,
    },
    {
      key: 'roleName',
      dataIndex: 'roleName',
      title: t('staffs.role'),
      width: 110,
    },
    {
      key: 'shopName',
      dataIndex: 'shopName',
      title: t('staffs.shopName'),
      width: 250,
      render: (value: string | null) => value ?? '—',
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: t('staffs.createdAt'),
      width: 150,
      render: (value: string) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      title: t('staffs.updatedAt'),
      width: 150,
      render: (value: string | null) =>
        value
          ? new Date(value).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('staffs.title')}
      </Typography.Title>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            onSearch={handleSearch}
            loading={searchLoading}
            placeholder={t('staffs.searchPlaceholder')}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          {t('form.create')}
        </Button>
      </div>

      <TableGrid<StaffItem>
        rowKey="profileId"
        columns={columns}
        dataSource={items}
        loading={loading || deleteLoading}
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
          setEditOpen(true);
        }}
        onDeleteClick={(record) => {
          confirmDelete({
            title: t('table.deleteConfirmTitle'),
            content: t('table.deleteConfirmDesc'),
            okText: t('table.deleteOk'),
            cancelText: t('table.deleteCancel'),
            okDanger: true,
            onConfirm: () => deleteStaff(record.profileId),
          });
        }}
      />

      <AppFormDrawer<StaffItem>
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        record={selectedRecord}
        fields={staffFields}
      />

      <StaffEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        record={selectedRecord}
        onSubmit={(values) => editStaff(selectedRecord!.profileId, values)}
        loading={editLoading}
        roleOptions={roleOptions}
        shopOptions={shopOptions}
        optionsLoading={optionsLoading}
      />

      <StaffCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createStaff}
        loading={createLoading}
        roleOptions={roleOptions}
        shopOptions={shopOptions}
        optionsLoading={optionsLoading}
      />
    </div>
  );
}
