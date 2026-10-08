import { useEffect, useState } from 'react';
import {
  Typography,
  Select,
  Tag,
  Button,
  Tooltip,
  Drawer,
  Descriptions,
  Table,
  Divider,
} from 'antd';
import { CreditCardOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { TableGrid, type AppColumnType } from '@/components/table/TableGrid';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useConfirmModal } from '@/components/modal/ConfirmModal';
import { InvoiceEditModal } from './components/InvoiceEditModal';
import { useInvoices } from './hooks/useInvoices';
import type { InvoiceItem } from './types';

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
  const isAdmin = roleName === ROLES.OWNER;

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
  } = useInvoices();

  const { confirm: confirmAction } = useConfirmModal();

  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InvoiceItem | null>(null);

  useEffect(() => {
    if (showEmptyModal) {
      showError(t('invoices.emptySearch'), t('common.error'));
      closeEmptyModal();
    }
  }, [showEmptyModal, showError, closeEmptyModal, t]);

  const columns: AppColumnType<InvoiceItem>[] = [
    {
      key: 'tableNumber',
      dataIndex: 'tableNumber',
      title: t('invoices.tableNumber'),
      width: 100,
      render: (val: number) => t('revenues.tablePrefix', { number: val }),
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
      render: (val: string) => {
        let color = 'default';
        if (val === t('invoices.statusOptions.serving')) color = 'processing';
        else if (val === t('invoices.statusOptions.paid')) color = 'success';
        else if (val === t('invoices.statusOptions.cancelled')) color = 'error';
        return <Tag color={color}>{val}</Tag>;
      },
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
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_: unknown, record: InvoiceItem) => {
        const isServing = record.status === t('invoices.statusOptions.serving');
        return (
          <div
            className="flex items-center justify-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pay Action */}
            <Tooltip title={isServing ? t('invoices.pay') : ''}>
              <Button
                type="text"
                shape="circle"
                disabled={!isServing}
                icon={
                  <CreditCardOutlined className={isServing ? 'text-emerald-500 text-base' : ''} />
                }
                onClick={() => {
                  confirmAction({
                    title: t('invoices.payConfirmTitle'),
                    content: t('invoices.payConfirmDesc'),
                    okText: t('invoices.payOk'),
                    cancelText: t('form.cancel'),
                    onConfirm: () => payInvoice(record.invoiceId),
                  });
                }}
              />
            </Tooltip>

            {/* Edit Action */}
            <Tooltip title={isServing ? t('form.edit') : ''}>
              <Button
                type="text"
                shape="circle"
                disabled={!isServing}
                icon={<EditOutlined className={isServing ? 'text-gray-700 text-base' : ''} />}
                onClick={() => {
                  setSelectedRecord(record);
                  setEditOpen(true);
                }}
              />
            </Tooltip>

            {/* Cancel Action */}
            <Tooltip title={isServing ? t('invoices.cancel') : ''}>
              <Button
                type="text"
                shape="circle"
                danger
                disabled={!isServing}
                icon={<StopOutlined className={isServing ? 'text-rose-500 text-base' : ''} />}
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
        {isAdmin && (
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
        loading={loading || payLoading || cancelLoading}
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
        width={580}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        closable={true}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setDetailOpen(false)}>{t('form.close')}</Button>
          </div>
        }
      >
        {selectedRecord && (
          <div className="flex flex-col gap-4">
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label={t('invoices.shopName')}>
                {selectedRecord.shopName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.staffName')}>
                {selectedRecord.staffName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.tableNumber')}>
                {selectedRecord.tableNumber !== undefined
                  ? t('revenues.tablePrefix', { number: selectedRecord.tableNumber })
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.status')}>
                <Tag
                  color={
                    selectedRecord.status === t('invoices.statusOptions.serving')
                      ? 'processing'
                      : selectedRecord.status === t('invoices.statusOptions.paid')
                        ? 'success'
                        : 'error'
                  }
                >
                  {selectedRecord.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('invoices.createdAt')}>
                {formatDate(selectedRecord.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            <Divider className="my-2" />

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
                  render: (val: string | undefined, r: InvoiceDetailItem) => val || r.name || '—',
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

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mt-2 border">
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
    </div>
  );
}
