import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';
import { formatPrice } from '@/utils/formatPrice';

interface Props {
  readonly totalAmount: number;
}

// Order total shown right above the submit buttons (create order page, edit invoice modal)
export function OrderTotal({ totalAmount }: Props) {
  const { t } = useTranslation();

  return (
    // Aligned right and as wide as its content, so a bigger amount widens the box (full width on phones)
    <div className="flex w-full items-center justify-between gap-3 self-end rounded-lg bg-emerald-50 px-1 py-3 sm:w-auto">
      <Typography.Text strong className="font-bold!">
        {t('order.total')}:
      </Typography.Text>
      <Typography.Text strong className="whitespace-nowrap text-lg font-bold! text-emerald-700!">
        {formatPrice(totalAmount)}
      </Typography.Text>
    </div>
  );
}
