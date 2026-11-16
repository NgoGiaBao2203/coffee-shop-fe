import { useEffect, useState } from 'react';
import { Typography, Select, Tag, Tooltip, Drawer, Descriptions, Table } from 'antd';
import { CreditCardOutlined, PrinterOutlined, StopOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { TableGrid, type AppColumnType } from '@/components/table/TableGrid';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { InvoiceEditModal } from './components/InvoiceEditModal';
import { InvoicePayModal } from './components/InvoicePayModal';
import { InvoiceStatusTag } from './components/InvoiceStatusTag';
import { useInvoices } from './hooks/useInvoices';
import type { InvoiceItem } from './types';
import { CloseButton } from '@/components/button/CloseButton';
import { ActionIconButton, EditIconButton } from '@/components/button/ActionIconButtons';

interface InvoiceDetailItem {
  id?: string | number;
  drinkId?: string | number;
  drinkName?: string;
  name?: string;
  size?: string;
  unitPrice?: number;
  price?: number;
  quantity?: number;
  subTotal?: number;
  totalPrice?: number;
  note?: string | null;
}

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

export function InvoicesPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isOwner = roleName === ROLES.OWNER;

  const {
    items,
    pagination,
    currentPage,
    currentPageSize,
    loading,
    searchLoading,
    searchKeyword,
    currentShopId,
    currentStatus,
    showEmptyModal,
    closeEmptyModal,
    handleSearch,
    handleShopFilter,
    handleStatusFilter,
    handlePageChange,
    editInvoice,
    editLoading,
    payInvoice,
    payLoading,
    cancelInvoice,
    cancelLoading,
    shopOptions,
    optionsLoading,
    canManageInvoice,
    canPrintInvoice,
    handlePrint,
    printingInvoiceId,
  } = useInvoices();

  const { confirm: confirmAction } = useConfirmModal();

  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InvoiceItem | null>(null);

  useEffect(() => {
    if (showEmptyModal) {
      showError(t('invoices.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal, showError, closeEmptyModal, t]);

  const columns: AppColumnType<InvoiceItem>[] = [
    {
      key: 'invoiceCode',
      dataIndex: 'invoiceCode',
      title: t('invoices.invoiceCode'),
      width: 200,
      render: (val?: string) => val || '—',
    },
    {
      key: 'tableNumber',
      dataIndex: 'tableNumber',
      title: t('invoices.tableNumber'),
      width: 100,
      render: (val: number | null) =>
        val == null ? '—' : t('revenues.tablePrefix', { number: val }),
    },
    {
      key: 'shopName',
      dataIndex: 'shopName',
      title: t('invoices.shopName'),
      width: 220,
    },
    {
      key: 'staffName',
      dataIndex: 'staffName',
      title: t('invoices.staffName'),
      width: 160,
    },
    {
      key: 'totalAmount',
      dataIndex: 'totalAmount',
      title: t('invoices.totalAmount'),
      width: 150,
      render: (val: number) => (
        <span className="font-medium text-emerald-600">
          {Number(val).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      key: 'status',
      dataIndex: 'status',
      title: t('invoices.status'),
      width: 140,
      render: (val: string) => <InvoiceStatusTag status={val} />,
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: t('invoices.createdAt'),
      width: 160,
      render: formatDate,
    },
    {
      key: 'actions',
      title: t('table.actions'),
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (_: unknown, record: InvoiceItem) => {
        const isServing = canManageInvoice(record);
        const isPrintable = canPrintInvoice(record);
        return (
          <div
            className="flex items-center justify-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pay Action */}
            <Tooltip title={isServing ? t('invoices.pay') : ''}>
              <ActionIconButton
                Icon={CreditCardOutlined}
                labelKey="invoices.pay"
                size="middle"
                disabled={!isServing}
                iconClassName={isServing ? 'text-emerald-500 text-base' : ''}
                onClick={() => {
                  setSelectedRecord(record);
                  setPayOpen(true);
                }}
              />
            </Tooltip>

            {/* Edit Action */}
            <Tooltip title={isServing ? t('form.edit') : ''}>
              <EditIconButton
                size="middle"
                disabled={!isServing}
                iconClassName={isServing ? 'text-gray-700 text-base' : ''}
                onClick={() => {
                  setSelectedRecord(record);
                  setEditOpen(true);
                }}
              />
            </Tooltip>

            {/* Cancel Action */}
            <Tooltip title={isServing ? t('invoices.cancel') : ''}>
              <ActionIconButton
                Icon={StopOutlined}
                labelKey="invoices.cancel"
                danger
                size="middle"
                disabled={!isServing}
                iconClassName={isServing ? 'text-rose-500 text-base' : ''}
                onClick={() => {
                  confirmAction({
                    title: t('invoices.cancelConfirmTitle'),
                    content: t('invoices.cancelConfirmDesc'),
                    okText: t('invoices.cancelOk'),
                    cancelText: t('form.cancel'),
                    okDanger: true,
                    onConfirm: () => cancelInvoice(record.invoiceId),
                  });
                }}
              />
            </Tooltip>

            {/* Print Action: paid invoices only (reprint the receipt) */}
            <Tooltip title={isPrintable ? t('invoices.print') : ''}>
              <ActionIconButton
                Icon={PrinterOutlined}
                labelKey="invoices.print"
                size="middle"
                disabled={!isPrintable}
                loading={printingInvoiceId === record.invoiceId}
                iconClassName={isPrintable ? 'text-sky-600 text-base' : ''}
                onClick={() => handlePrint(record.invoiceId)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const recordWithDetails = selectedRecord as
    | (InvoiceItem & {
        invoiceDetails?: InvoiceDetailItem[];
        items?: InvoiceDetailItem[];
        orderDetails?: InvoiceDetailItem[];
      })
    | null;

  const invoiceDetails: InvoiceDetailItem[] =
    recordWithDetails?.invoiceDetails ||
    recordWithDetails?.items ||
    recordWithDetails?.orderDetails ||
    [];

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm overflow-hidden">
      <Typography.Title level={4} className="mb-0!">
        {t('invoices.title')}
      </Typography.Title>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={handleSearch}
            loading={searchLoading}
            placeholder={t('invoices.searchPlaceholder')}
          />
        </div>

        <Select
          allowClear
          placeholder={t('invoices.filterStatus')}
          value={currentStatus || undefined}
          onChange={(val) => handleStatusFilter(val ?? '')}
          className="w-40"
          options={[
            { label: t('invoices.statusOptions.serving'), value: '0' },
            { label: t('invoices.statusOptions.paid'), value: '1' },
            { label: t('invoices.statusOptions.cancelled'), value: '2' },
          ]}
        />

        {/* Shop filter dropdown: Only to Owner */}
        {isOwner && (
          <Select
            allowClear
            placeholder={t('invoices.filterShop')}
            options={shopOptions}
            loading={optionsLoading}
            value={currentShopId || undefined}
            onChange={(val) => handleShopFilter(val ?? '')}
            className="w-52"
          />
        )}
      </div>

      <TableGrid<InvoiceItem>
        rowKey="invoiceId"
        columns={columns}
        dataSource={items}
        loading={loading || cancelLoading}
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

      {/* Drawer View invoice details */}
      <Drawer
        title={t('invoices.detailTitle')}
        size={580}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        closable={true}
        footer={<CloseButton onClose={() => setDetailOpen(false)} />}
      >
        {selectedRecord && (
          <div className="flex flex-col gap-3">
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label={t('invoices.invoiceCode')}>
                {selectedRecord.invoiceCode || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.shopName')}>
                {selectedRecord.shopName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.staffName')}>
                {selectedRecord.staffName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.tableNumber')}>
                {selectedRecord.tableNumber != null
                  ? t('revenues.tablePrefix', { number: selectedRecord.tableNumber })
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.status')}>
                <InvoiceStatusTag status={selectedRecord.status} />
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.createdAt')}>
                {formatDate(selectedRecord.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Text strong className="text-base">
              {t('invoices.itemsList')}
            </Typography.Text>

            <Table<InvoiceDetailItem>
              rowKey={(r) => String(r.id || r.drinkId || (r.drinkName ?? '') + (r.size ?? ''))}
              dataSource={invoiceDetails}
              pagination={false}
              size="small"
              columns={[
                {
                  title: t('invoices.drinkName'),
                  dataIndex: 'drinkName',
                  key: 'drinkName',
                  // The note (if any) is shown under the drink name
                  render: (val: string | undefined, r: InvoiceDetailItem) => (
                    <div className="flex flex-col">
                      <span>{val || r.name || '—'}</span>
                      {r.note?.trim() && (
                        <Typography.Text type="secondary" className="text-xs">
                          {t('invoices.note')}: {r.note}
                        </Typography.Text>
                      )}
                    </div>
                  ),
                },
                {
                  title: t('invoices.size'),
                  dataIndex: 'size',
                  key: 'size',
                  width: 70,
                  align: 'center',
                  render: (val: string | undefined) => <Tag>{val || 'M'}</Tag>,
                },
                {
                  title: t('invoices.unitPrice'),
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  align: 'right',
                  render: (val: number | undefined, r: InvoiceDetailItem) =>
                    `${Number(val ?? r.price ?? 0).toLocaleString('vi-VN')} đ`,
                },
                {
                  title: t('invoices.quantity'),
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 60,
                  align: 'center',
                },
                {
                  title: t('invoices.subTotal'),
                  key: 'subTotal',
                  align: 'right',
                  render: (_: unknown, r: InvoiceDetailItem) => {
                    const price = Number(r.unitPrice ?? r.price ?? 0);
                    const qty = Number(r.quantity ?? 1);
                    const total = r.subTotal ?? r.totalPrice ?? price * qty;
                    return (
                      <span className="font-medium text-emerald-600">
                        {Number(total).toLocaleString('vi-VN')} đ
                      </span>
                    );
                  },
                },
              ]}
            />

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
              <span className="font-semibold text-gray-700">{t('invoices.totalAmount')}:</span>
              <span className="font-bold text-lg text-emerald-600">
                {Number(selectedRecord.totalAmount || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit Invoice Modal */}
      <InvoiceEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        record={selectedRecord}
        onSubmit={editInvoice}
        loading={editLoading}
      />

      {/* Pay Invoice Modal: print or don't print the receipt */}
      <InvoicePayModal
        open={payOpen}
        record={selectedRecord}
        onClose={() => setPayOpen(false)}
        onSubmit={async (shouldPrint) => {
          if (!selectedRecord) return;
          await payInvoice(selectedRecord.invoiceId, shouldPrint);
          setPayOpen(false);
        }}
        loading={payLoading}
      />
    </div>
  );
}
