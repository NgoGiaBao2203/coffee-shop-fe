import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/toast/useToast';
import { useOrderEditor } from '@/hooks/useOrderEditor';
import { createOrderApi } from '../api/ordersApi';

const DRINKS_PATH = '/drinks';

// Create-order page state: shop from the query string, order editor and the create call
export function useOrders() {
  const toast = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // OWNER picks the shop on the drinks page and passes it as ?shopId=; other roles have none
  const shopId = searchParams.get('shopId') ?? '';

  const editor = useOrderEditor(true, shopId);
  const [createLoading, setCreateLoading] = useState(false);

  const handleBack = () => navigate(DRINKS_PATH);

  // Create an unpaid (PENDING) invoice for the selected table and drinks, then go back
  const handleCreate = async () => {
    const order = editor.buildOrderPayload();

    if (!order) return;

    setCreateLoading(true);

    try {
      await createOrderApi(order);

      toast.success(t('orders.createSuccess'));
      navigate(DRINKS_PATH);
    } catch (error) {
      // ER008 is shown by the order editor, other codes by the interceptor
      editor.handleOrderError(error);
      setCreateLoading(false);
    }
  };

  return {
    editor,
    createLoading,
    handleBack,
    handleCreate,
  };
}
