import { Button, Drawer, Radio, Spin, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { DrinkItem } from '../types';

interface DrinkDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  selected: DrinkItem | null;
  detailLoading: boolean;
  selectedVariantIndex: number;
  onSelectedVariantIndexChange: (index: number) => void;
}

export function DrinkDetailDrawer({
  open,
  onClose,
  selected,
  detailLoading,
  selectedVariantIndex,
  onSelectedVariantIndexChange,
}: DrinkDetailDrawerProps) {
  const { t } = useTranslation();
  const fallbackImage = 'https://placehold.co/600x400?text=No+Image';

  const formatCurrency = (amount: number | string | undefined | null) => {
    if (amount === undefined || amount === null || amount === '—') return '—';
    const num = Number(String(amount).replace(/[^0-9.-]+/g, '')) || 0;
    return `${num.toLocaleString('vi-VN')}đ`;
  };

  const priceForSelected = () => {
    if (!selected || !selected.variants || selected.variants.length === 0) return 0;
    const v = selected.variants[selectedVariantIndex];
    return v?.price ?? 0;
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      title={selected?.drinkName}
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>{t('form.close')}</Button>
        </div>
      }
    >
      <Spin spinning={detailLoading}>
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
              <img
                src={selected.imageUrl || fallbackImage}
                alt="drink"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (el.src !== fallbackImage) {
                    el.src = fallbackImage;
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Typography.Title level={4} className="mb-0!">
                {selected.drinkName}
              </Typography.Title>
              {selected?.variants && selected.variants.length > 0 && (
                <Tag color="green">{selected.variants.length} size</Tag>
              )}
            </div>

            {selected?.variants && selected.variants.length > 0 && (
              <div>
                <Typography.Text strong>{t('drinks.chooseSize')}</Typography.Text>
                <div className="mt-2 w-full overflow-x-auto">
                  <Radio.Group
                    value={selectedVariantIndex}
                    onChange={(e) => onSelectedVariantIndexChange(Number(e.target.value))}
                    buttonStyle="solid"
                    className="flex flex-wrap gap-2"
                  >
                    {selected.variants.map((v, idx) => (
                      <Radio.Button key={v.drinkId || idx} value={idx}>
                        {v.size.trim()} - {formatCurrency(v.price)}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <div>
                <div className="text-sm text-gray-500">{t('drinks.price')}</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(priceForSelected())}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">{t('drinks.status')}</div>
                <Tag
                  color={
                    selected?.status === 'Đang bán' || selected?.status === t('drinks.statusActive')
                      ? 'green'
                      : 'default'
                  }
                  className="mt-1 mr-0"
                >
                  {selected?.status ?? '—'}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Spin>
    </Drawer>
  );
}
