import { Modal, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import type { GroupedInvoice } from '../hooks/useRevenues';

// Props interface for RevenueDetailModal component
interface RevenueDetailModalProps {
  open: boolean;
  onClose: () => void;
  record: GroupedInvoice | null;
  formatDateTime: (val: unknown) => string;
  formatCurrency: (amount: number) => string;
}

/**
 * Modal component to display detailed information of a specific invoice
 */
export function RevenueDetailModal({
  open,
  onClose,
  record,
  formatDateTime,
  formatCurrency,
}: RevenueDetailModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={`${t('revenues.modalTitle')} - ${record?.invoiceId || ''}`}
      footer={null}
      width={680}
      centered
      className="max-w-[95vw] sm:max-w-[680px]"
    >
      {record && (
        <div className="flex flex-col gap-3 pt-2">
          {/* General Invoice Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-gray-50 p-2.5 rounded-lg border">
            <div>
              <b className="font-semibold text-gray-700">{t('revenues.shopName')}:</b>{' '}
              <span className="font-normal text-gray-900">{record.shopName}</span>
            </div>
            <div>
              <b className="font-semibold text-gray-700">{t('revenues.fullName')}:</b>{' '}
              <span className="font-normal text-gray-900">{record.fullName}</span>
            </div>
            <div>
              <b className="font-semibold text-gray-700">{t('revenues.tableNumber')}:</b>{' '}
              <span className="font-normal text-gray-900">
                {record.tableNumber
                  ? t('revenues.tablePrefix', { number: record.tableNumber })
                  : '—'}
              </span>
            </div>
            <div>
              <b className="font-semibold text-gray-700">{t('revenues.createdAt')}:</b>{' '}
              <span className="font-normal text-gray-900">{formatDateTime(record.createdAt)}</span>
            </div>
          </div>

          {/* Ordered Items Table */}
          <Table
            dataSource={record.items}
            rowKey={(item, idx) => `${item.drinkName}-${item.size}-${idx}`}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
            columns={[
              { title: t('revenues.drinkName'), dataIndex: 'drinkName', key: 'drinkName' },
              {
                title: t('revenues.size'),
                dataIndex: 'size',
                key: 'size',
                width: 70,
                align: 'center',
              },
              {
                title: t('revenues.quantity'),
                dataIndex: 'quantity',
                key: 'quantity',
                width: 80,
                align: 'center',
              },
              {
                title: t('revenues.price'),
                dataIndex: 'price',
                key: 'price',
                align: 'right',
                render: (price: number) => formatCurrency(price),
              },
              {
                title: t('revenues.totalAmount'),
                key: 'total',
                align: 'right',
                render: (_, item) => formatCurrency(item.price * item.quantity),
              },
              {
                title: t('revenues.note'),
                dataIndex: 'note',
                key: 'note',
                render: (val) => val || '—',
              },
            ]}
          />

          {/* Total Amount Summary */}
          <div className="flex justify-end items-center gap-2 text-base font-medium pt-2 border-t">
            <span>{t('revenues.totalAmount')}:</span>
            <span className="text-lg font-bold text-emerald-600">
              {formatCurrency(record.totalAmount)}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
