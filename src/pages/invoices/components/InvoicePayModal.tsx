import { useState } from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { AppModal } from '@/components/modal/AppModal';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { OrderTotal } from '@/components/order/OrderTotal';
import type { InvoiceItem } from '../types';

interface InvoicePayModalProps {
  readonly open: boolean;
  readonly record: InvoiceItem | null;
  readonly onClose: () => void;
  // shouldPrint = true: pay then print the receipt
  readonly onSubmit: (shouldPrint: boolean) => Promise<void>;
  readonly loading?: boolean;
}

// Pay confirmation: "Print" pays and prints the 80mm receipt, "Don't print" only pays.
// Closing the modal (X / Esc / mask) does not pay.
export function InvoicePayModal({
  open,
  record,
  onClose,
  onSubmit,
  loading = false,
}: InvoicePayModalProps) {
  const { t } = useTranslation();
  // Which button was clicked, so only that one shows the spinner
  const [printChoice, setPrintChoice] = useState<boolean | null>(null);

  const handleSubmit = async (shouldPrint: boolean) => {
    setPrintChoice(shouldPrint);
    try {
      await onSubmit(shouldPrint);
    } finally {
      setPrintChoice(null);
    }
  };

  return (
    <AppModal
      title={t('invoices.payConfirmTitle')}
      open={open}
      onCancel={onClose}
      closable={!loading}
      maskClosable={!loading}
      keyboard={!loading}
      width={420}
      footer={
        <SubmitButtons
          onCancel={() => handleSubmit(false)}
          onSubmit={() => handleSubmit(true)}
          cancelText={t('invoices.payNoPrint')}
          submitText={t('invoices.payPrint')}
          cancelLoading={loading && printChoice === false}
          loading={loading && printChoice === true}
        />
      }
    >
      <div className="flex flex-col gap-2">
        <Typography.Text>{t('invoices.payPrintDesc')}</Typography.Text>
        {record && (
          <>
            <Typography.Text type="secondary">
              {t('invoices.invoiceCode')}: {record.invoiceCode || '—'}
            </Typography.Text>
            <OrderTotal totalAmount={record.totalAmount} />
          </>
        )}
      </div>
    </AppModal>
  );
}
