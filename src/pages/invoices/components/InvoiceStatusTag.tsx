import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { INVOICE_STATUS_NAME } from '../types';

const STATUS_TAGS: Record<string, { color: string; labelKey: string }> = {
  [INVOICE_STATUS_NAME.PENDING]: {
    color: 'processing',
    labelKey: 'invoices.statusOptions.serving',
  },
  [INVOICE_STATUS_NAME.COMPLETED]: { color: 'success', labelKey: 'invoices.statusOptions.paid' },
  [INVOICE_STATUS_NAME.CANCELLED]: { color: 'error', labelKey: 'invoices.statusOptions.cancelled' },
};

interface InvoiceStatusTagProps {
  readonly status: string;
}

// Colored tag for the invoice status returned by the API (PENDING / COMPLETED / CANCELLED)
export function InvoiceStatusTag({ status }: InvoiceStatusTagProps) {
  const { t } = useTranslation();
  const tag = STATUS_TAGS[status];

  return <Tag color={tag?.color ?? 'default'}>{tag ? t(tag.labelKey) : status}</Tag>;
}
