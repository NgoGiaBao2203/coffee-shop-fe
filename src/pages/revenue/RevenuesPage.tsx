import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { TableGrid, type AppColumnType } from '@/components/table/TableGrid';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useSearchValidation } from '@/hooks/useSearchValidation';
import { useRevenues } from './hooks/useRevenues';
import type { RevenueInvoice } from './types';
import { RevenueFilter } from './components/RevenueFilter';
import { RevenueDetailModal } from './components/RevenueDetailModal';

const formatDateTime = (value: unknown) =>
  value
    ? new Date(value as string).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export function RevenuesPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();
  const validateSearch = useSearchValidation();
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isOwner = roleName === ROLES.OWNER;

  const {
    invoices,
    pagination,
    currentPage,
    currentPageSize,
    loading,
    searchLoading,
    searchKeyword,
    currentShopId,
    showEmptyModal,
    closeEmptyModal,
    handleSearch,
    handleShopFilter,
    handlePageChange,
    shopOptions,
    optionsLoading,
    totalRevenue,
    totalInvoices,
    filterType,
    pickedDate,
    setPickedDate,
    handleFilterTypeChange,
    handleApplyFilter,
    handleResetFilter,
  } = useRevenues();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RevenueInvoice | null>(null);

  useEffect(() => {
    if (showEmptyModal) {
      showError(t('revenues.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal, closeEmptyModal, showError, t]);

  const columns: AppColumnType<RevenueInvoice>[] = [
    {
      key: 'invoiceCode',
      dataIndex: 'invoiceCode',
      title: t('revenues.invoiceCode'),
      width: 220,
      align: 'center',
      render: (val: string) => val || '—',
    },
    {
      key: 'shopName',
      dataIndex: 'shopName',
      title: t('revenues.shopName'),
      width: 150,
      align: 'center',
    },
    {
      key: 'staffName',
      dataIndex: 'staffName',
      title: t('revenues.staffName'),
      width: 130,
      align: 'center',
    },
    {
      key: 'tableNumber',
      dataIndex: 'tableNumber',
      title: t('revenues.tableNumber'),
      width: 80,
      align: 'center',
      render: (val: number | null) => (val ? t('revenues.tablePrefix', { number: val }) : '—'),
    },
    {
      key: 'totalAmount',
      dataIndex: 'totalAmount',
      title: t('revenues.totalAmount'),
      width: 120,
      align: 'center',
      render: (val: number) => (
        <span className="font-semibold text-emerald-600">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: t('revenues.createdAt'),
      width: 140,
      align: 'center',
      render: (val: string) => formatDateTime(val),
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl p-3 sm:p-4 bg-white shadow-sm w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Typography.Title level={4} className="mb-0!">
          {t('revenues.title')}
        </Typography.Title>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-1 rounded-lg border border-gray-200 flex-1 sm:flex-none justify-between">
            <span className="text-sm font-medium">{t('revenues.totalInvoices')}:</span>
            <span className="text-base font-bold">{totalInvoices}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200 flex-1 sm:flex-none justify-between">
            <span className="text-sm font-medium">{t('revenues.totalRevenue')}:</span>
            <span className="text-base font-bold">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Component */}
      <RevenueFilter
        filterType={filterType}
        onFilterTypeChange={handleFilterTypeChange}
        pickedDate={pickedDate}
        onPickedDateChange={setPickedDate}
        isOwner={isOwner}
        currentShopId={currentShopId}
        shopOptions={shopOptions}
        optionsLoading={optionsLoading}
        onShopFilter={handleShopFilter}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
        onSearch={(keyword) => validateSearch(keyword) && handleSearch(keyword)}
        searchLoading={searchLoading}
      />

      {/* Main Table Component */}
      <TableGrid<RevenueInvoice>
        rowKey="invoiceId"
        columns={columns}
        dataSource={invoices}
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
      />

      {/* Detail Modal Component */}
      <RevenueDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        record={selectedRecord}
        formatDateTime={formatDateTime}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
