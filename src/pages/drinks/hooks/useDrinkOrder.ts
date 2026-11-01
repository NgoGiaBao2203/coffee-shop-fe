import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { useOrderEditor } from '@/hooks/useOrderEditor';
import { createInvoiceApi } from '@/pages/invoices/api/invoicesAPI';
import type { InvoicePaymentStatus } from '@/pages/invoices/types';

// Default payment: paid at the counter (1). Pay later is 0. The API requires status explicitly.
const DEFAULT_PAYMENT_STATUS: InvoicePaymentStatus = 1;

// Custom hook managing the order flow: pick drinks, pick table, pick payment, create invoice
export function useDrinkOrder(open: boolean, shopId: string, onCreated: () => void) {
  const toast = useToast();
  const { t } = useTranslation();

  const editor = useOrderEditor(open, shopId);

  const [paymentStatus, setPaymentStatus] = useState<InvoicePaymentStatus>(DEFAULT_PAYMENT_STATUS);
  const [createLoading, setCreateLoading] = useState(false);

  const handleReset = () => {
    editor.reset();
    setPaymentStatus(DEFAULT_PAYMENT_STATUS);
  };

  // Create an invoice (paid now or pay later) for the selected table and drinks
  const handleCreateOrder = async () => {
    const order = editor.buildOrderPayload();

    if (!order) return;

    setCreateLoading(true);

    try {
      await createInvoiceApi({ ...order, status: paymentStatus });

      toast.success(t('drinks.orderSuccess'));
      handleReset();
      onCreated();
    } catch (error) {
      // Error notification is already shown by the response interceptor
      console.error('Failed to create order:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    editor,
    paymentStatus,
    createLoading,
    setPaymentStatus,
    handleReset,
    handleCreateOrder,
  };
}
