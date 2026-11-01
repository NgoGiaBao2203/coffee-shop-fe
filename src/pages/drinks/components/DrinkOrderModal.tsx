import { useTranslation } from 'react-i18next';
import { Button, Typography } from 'antd';
import { AppModal } from '@/components/modal/AppModal';
import { SubmitButtons } from '@/components/button/SubmitButtons';
import { OrderEditor } from '@/components/order/OrderEditor';
import { useDrinkOrder } from '../hooks/useDrinkOrder';

// Payment choices: 1 = paid at the counter, 0 = pay later
const PAYMENT_OPTIONS = [
  { value: 1, labelKey: 'drinks.orderPaymentCash' },
  { value: 0, labelKey: 'drinks.orderPaymentLater' },
] as const;

interface Props {
  readonly open: boolean;
  readonly shopId: string;
  readonly onClose: () => void;
  readonly onCreated: () => void;
}

export function DrinkOrderModal({ open, shopId, onClose, onCreated }: Props) {
  const { t } = useTranslation();

  const { editor, paymentStatus, createLoading, setPaymentStatus, handleReset, handleCreateOrder } =
    useDrinkOrder(open, shopId, onCreated);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <AppModal
      open={open}
      title={t('drinks.orderTitle')}
      onCancel={handleClose}
      width={1280}
      mask={{ closable: !createLoading }}
      footer={
        <SubmitButtons
          onCancel={handleClose}
          onSubmit={handleCreateOrder}
          submitText={t('drinks.orderConfirm')}
          loading={createLoading}
          disabled={!editor.canSubmit}
        />
      }
    >
      <OrderEditor
        editor={editor}
        footerExtra={
          <div className="flex items-center justify-between">
            <Typography.Text>{t('drinks.orderPaymentMethod')}</Typography.Text>
            <div className="flex gap-2">
              {PAYMENT_OPTIONS.map(({ value, labelKey }) => (
                <Button
                  key={value}
                  color={paymentStatus === value ? 'green' : 'default'}
                  variant={paymentStatus === value ? 'filled' : 'outlined'}
                  onClick={() => setPaymentStatus(value)}
                >
                  {t(labelKey)}
                </Button>
              ))}
            </div>
          </div>
        }
      />
    </AppModal>
  );
}
