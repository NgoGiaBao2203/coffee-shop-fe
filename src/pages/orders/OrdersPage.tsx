import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { OrderEditor } from '@/components/order/OrderEditor';
import { OrderTotal } from '@/components/order/OrderTotal';
import { useOrders } from './hooks/useOrders';

export function OrdersPage() {
  const { t } = useTranslation();
  const { editor, createLoading, handleBack, handleCreate } = useOrders();

  return (
    // Fills the fixed-height layout content: only the editor area scrolls (never the whole page)
    <div className="flex h-full flex-col gap-3 overflow-hidden rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          size="small"
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          disabled={createLoading}
          aria-label={t('orders.back')}
        />
        <Typography.Title level={5} className="mb-0!">
          {t('orders.title')}
        </Typography.Title>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <OrderEditor editor={editor} />
      </div>

      {/* Total right above the submit buttons */}
      <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
        <OrderTotal totalAmount={editor.totalAmount} />
        <div className="flex justify-end gap-2">
          <SubmitButtons
            onCancel={handleBack}
            onSubmit={handleCreate}
            submitText={t('orders.confirm')}
            loading={createLoading}
            disabled={!editor.canSubmit}
            submitFirst
          />
        </div>
      </div>
    </div>
  );
}
