import { useState, useEffect } from 'react';
import { Typography, Button, Select, Pagination, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { SearchInput } from '@/components/search/SearchInput';
import { AppFormDrawer, type FormFieldConfig } from '@/components/form/AppFormDrawer';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { useTables } from './hooks/useTables';
import { TableCard } from './components/TableCard';
import { tableStatusKey } from './utils/utils';
import { TableCreateModal } from './components/TableCreateModal';
import { TableEditModal } from './components/TableEditModal';
import type { TableItem } from './types';

const SEARCH_PATTERN = /^[\p{L}0-9\s.,/&'#-]*$/u;
const SEARCH_MAX_LENGTH = 100;

/** Format timestamp to: HH:mm DD/MM/YYYY (e.g. 15:23 05/09/2026) */
function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    let parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) {
      parsed = new Date(dateStr.replace(' ', 'T'));
    }
    if (Number.isNaN(parsed.getTime())) return dateStr;
    const hh = String(parsed.getHours()).padStart(2, '0');
    const mm = String(parsed.getMinutes()).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const MM = String(parsed.getMonth() + 1).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${hh}:${mm} ${dd}/${MM}/${yyyy}`;
  } catch {
    return dateStr;
  }
}

export function TablesPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();
  const { confirm: confirmDelete } = useConfirmModal();

  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isStaff = roleName === ROLES.STAFF;
  const isOwner = roleName === ROLES.OWNER;

  const {
    items,
    totalElements,
    currentPage,
    currentPageSize,
    searchKeyword,
    currentStatus,
    currentShopId,
    loading,
    searchLoading,
    createLoading,
    editLoading,
    deleteLoading,
    optionsLoading,
    shopOptions,
    showEmptyModal,
    closeEmptyModal,
    handleSearch,
    handleStatusFilter,
    handleShopFilter,
    handlePageChange,
    createTable,
    editTable,
    deleteTable,
  } = useTables(1, 10);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TableItem | null>(null);

  // Table details configuration: OWNER and MANAGER can view createdAt and updatedAt; STAFF cannot
  const tableFields: FormFieldConfig[] = [
    {
      name: 'tableNumber',
      label: t('tables.tableNumber'),
      readOnly: true,
      render: (value: unknown) => (value as number) || selectedRecord?.tableNumber || '—',
    },
    {
      name: 'shopName',
      label: t('tables.shopName'),
      readOnly: true,
      render: (value: unknown) => (value as string) || selectedRecord?.shopName || '—',
    },
    {
      name: 'description',
      label: t('tables.description'),
      readOnly: true,
      render: (value: unknown) => (value as string) || '—',
    },
    {
      name: 'status',
      label: t('tables.status'),
      readOnly: true,
      render: (value: unknown) => t(tableStatusKey(Number(value))),
    },
    ...(!isStaff
      ? [
          {
            name: 'createdAt',
            label: t('shops.createdAt'),
            readOnly: true,
            render: (value: unknown) =>
              formatDateTime((value as string) || selectedRecord?.createdAt),
          },
          {
            name: 'updatedAt',
            label: t('shops.updatedAt'),
            readOnly: true,
            render: (value: unknown) =>
              formatDateTime((value as string) || selectedRecord?.updatedAt),
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (showEmptyModal) {
      showError(t('tables.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTableSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed.length > SEARCH_MAX_LENGTH) {
      showError(t('tables.searchMaxLength'), t('common.error'));
      return;
    }
    if (trimmed && !SEARCH_PATTERN.test(trimmed)) {
      showError(t('tables.searchInvalid'), t('common.error'));
      return;
    }
    handleSearch(keyword);
  };

  const handleOpenDetail = (record: TableItem) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const handleOpenEdit = (record: TableItem) => {
    setSelectedRecord(record);
    setEditOpen(true);
  };

  const handleDeleteClick = (record: TableItem) => {
    confirmDelete({
      title: t('table.deleteConfirmTitle'),
      content: t('tables.deleteConfirmDesc', { name: record.tableNumber }),
      okText: t('table.deleteOk'),
      cancelText: t('table.deleteCancel'),
      okDanger: true,
      onConfirm: async () => {
        try {
          await deleteTable(record);
        } catch {
          // Error notification handled inside hook
        }
      },
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-xl bg-white p-4 shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('tables.title')}
      </Typography.Title>

      {/* Toolbar: search, status filter, branch filter (OWNER only), and create action */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={handleTableSearch}
            loading={searchLoading}
            placeholder={t('tables.searchPlaceholder')}
          />
        </div>

        <Select
          allowClear
          placeholder={t('tables.filterStatus')}
          value={currentStatus}
          onChange={(val) => handleStatusFilter(val)}
          className="w-48"
          options={[
            { value: 1, label: t('tables.statusOptions.available') },
            { value: 2, label: t('tables.statusOptions.occupied') },
            { value: 3, label: t('tables.statusOptions.reserved') },
          ]}
        />

        {isOwner && (
          <Select
            allowClear
            placeholder={t('tables.filterShop')}
            options={shopOptions}
            loading={optionsLoading}
            value={currentShopId || undefined}
            onChange={(val) => handleShopFilter(val ?? '')}
            className="w-52"
            showSearch={{ optionFilterProp: 'label' }}
          />
        )}

        {!isStaff && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('form.create')}
          </Button>
        )}
      </div>

      {/* Table cards square grid */}
      <div className="relative min-h-0 w-full flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/30 p-3">
        {loading || deleteLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <Spin description={t('common.loading')} />
          </div>
        ) : null}

        {items.length === 0 && !loading && !deleteLoading ? (
          <div className="py-16 flex justify-center items-center w-full min-h-[360px]">
            <Empty
              description={searchKeyword.trim() ? t('table.emptySearch') : t('table.emptyData')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 items-stretch pt-1 px-1 pb-3 w-full">
            {items.map((record) => (
              <TableCard
                key={record.tableId}
                record={record}
                onClick={handleOpenDetail}
                onEdit={isStaff ? undefined : handleOpenEdit}
                onDelete={isStaff ? undefined : handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-1 w-full">
        <div className="flex-1" />

        <div className="flex-1 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={currentPageSize}
            total={totalElements}
            onChange={(p, ps) => handlePageChange(p, ps)}
            showSizeChanger={false}
          />
        </div>

        <div className="flex-1 flex justify-end">
          <Select
            value={currentPageSize}
            onChange={(val) => handlePageChange(1, Number(val))}
            options={[
              { value: 10, label: `10 / ${t('table.perPage')}` },
              { value: 15, label: `15 / ${t('table.perPage')}` },
              { value: 20, label: `20 / ${t('table.perPage')}` },
            ]}
            style={{ width: 120 }}
          />
        </div>
      </div>

      {/* Detail Drawer */}
      <AppFormDrawer<TableItem>
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        record={selectedRecord}
        fields={tableFields}
      />

      <TableCreateModal
        open={createOpen}
        loading={createLoading}
        onClose={() => setCreateOpen(false)}
        onSubmit={createTable}
        shopOptions={shopOptions}
        optionsLoading={optionsLoading}
        defaultShopId={currentShopId}
      />

      <TableEditModal
        open={editOpen}
        loading={editLoading}
        record={selectedRecord}
        onClose={() => setEditOpen(false)}
        onSubmit={(values) => editTable(selectedRecord!, values)}
        shopOptions={shopOptions}
        optionsLoading={optionsLoading}
      />
    </div>
  );
}
