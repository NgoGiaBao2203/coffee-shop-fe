import { useEffect, useState, useMemo } from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { TableGrid, type AppColumnType } from '@/components/table/TableGrid';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useRevenues, type GroupedInvoice } from './hooks/useRevenues';
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
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isOwner = roleName === ROLES.OWNER;

  const {
    groupedInvoices,
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
  } = useRevenues();

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GroupedInvoice | null>(null);

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` })),
    [],
  );

  const yearOptions = useMemo(() => {
    const currentYearNum = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => ({
      value: currentYearNum - i,
      label: `Năm ${currentYearNum - i}`,
    }));
  }, []);

  useEffect(() => {
    if (showEmptyModal) {
      showError(t('revenues.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal, closeEmptyModal, showError, t]);

  const columns: AppColumnType<GroupedInvoice>[] = [
    {
      key: 'invoiceId',
      dataIndex: 'invoiceId',
      title: t('revenues.invoiceId'),
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
      key: 'fullName',
      dataIndex: 'fullName',
      title: t('revenues.fullName'),
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
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-sm font-medium">{t('revenues.totalRevenue')}:</span>
          <span className="text-base font-bold">{formatCurrency(aggregatedTotalAmount)}</span>
        </div>
      </div>

      {/* Filter Toolbar Component */}
      <RevenueFilter
        filterType={filterType}
        setFilterType={setFilterType}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        isOwner={isOwner}
        currentShopId={currentShopId}
        shopOptions={shopOptions}
        optionsLoading={optionsLoading}
        onShopFilter={handleShopFilter}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
        onSearch={handleSearch}
        searchLoading={searchLoading}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
      />

      {/* Main Table Component */}
      <TableGrid<GroupedInvoice>
        rowKey="invoiceId"
        columns={columns}
        dataSource={groupedInvoices}
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
