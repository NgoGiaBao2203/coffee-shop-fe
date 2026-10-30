import { Button, Drawer, Empty, Spin, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { resolveImageUrl } from '@/utils/image';
import { formatPrice } from '@/utils/formatPrice';
import { DRINK_SIZES, isDrinkActive } from '../constants';
import type { DrinkItem, DrinkVariantItem } from '../types';

interface DrinkDetailDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly selected: DrinkItem | null;
  readonly detailLoading: boolean;
  readonly isStaff: boolean;
  readonly onAdd?: () => void;
  readonly onEdit?: (record: DrinkVariantItem) => void;
  readonly onDelete?: (record: DrinkVariantItem) => void;
}

// Get display order for drink sizes
function getSizeOrder(size: string): number {
  const index = DRINK_SIZES.indexOf(size as (typeof DRINK_SIZES)[number]);

  return index === -1 ? DRINK_SIZES.length : index;
}

export function DrinkDetailDrawer({
  open,
  onClose,
  selected,
  detailLoading,
  isStaff,
  onAdd,
  onEdit,
  onDelete,
}: DrinkDetailDrawerProps) {
  const { t } = useTranslation();

  // Fallback image when drink image is unavailable
  const fallbackImage = 'https://placehold.co/600x400?text=No+Image';

  // Sort drink variants by configured size order
  const variants = [...(selected?.variants ?? [])].sort(
    (first, second) => getSizeOrder(first.size) - getSizeOrder(second.size),
  );

  // Get existing sizes to prevent duplicate variants
  const existingSizes = new Set(variants.map((variant) => variant.size.trim().toUpperCase()));

  // Check whether another size can still be added
  const hasAvailableSize = DRINK_SIZES.some((size) => !existingSizes.has(size));

  // Check current drink selling status
  const isActive = isDrinkActive(selected?.status);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="min(520px, 100vw)"
      title={selected?.drinkName}
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>{t('form.close')}</Button>
        </div>
      }
    >
      {/* Show loading state while fetching drink detail */}
      <Spin spinning={detailLoading}>
        {selected && (
          <div className="flex flex-col gap-4">
            {/* Drink image */}
            <img
              src={resolveImageUrl(selected.imageUrl) || fallbackImage}
              alt={selected.drinkName}
              className="block h-auto w-full rounded-lg object-contain"
              onError={(event) => {
                const element = event.currentTarget;

                if (element.src !== fallbackImage) {
                  element.src = fallbackImage;
                }
              }}
            />

            {/* Drink name and variant count */}
            <div className="flex flex-wrap items-center gap-2">
              <Typography.Title level={4} className="mb-0!">
                {selected.drinkName}
              </Typography.Title>

              {variants.length > 0 && (
                <Tag color="green">
                  {t('drinkDetails.sizeCount', {
                    count: variants.length,
                  })}
                </Tag>
              )}
            </div>

            {/* Drink category */}
            <div>
              <Typography.Text type="secondary" className="text-sm">
                {t('drinks.category')}
              </Typography.Text>

              <div className="mt-1">
                <Tag color="blue">{selected.categoryName || t('drinks.noCategory')}</Tag>
              </div>
            </div>

            {/* Drink size and price management */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Typography.Text strong>{t('drinkDetails.sizesAndPrices')}</Typography.Text>

                {/* Add new size for OWNER and MANAGER */}
                {!isStaff && onAdd && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    disabled={!isActive || detailLoading || !hasAvailableSize}
                    onClick={onAdd}
                  >
                    {t('drinkDetails.addSize')}
                  </Button>
                )}
              </div>

              {!isStaff && !isActive && (
                <Typography.Paragraph type="secondary">
                  {t('drinkDetails.inactiveNotice')}
                </Typography.Paragraph>
              )}

              {/* Show empty state when no variants exist */}
              {variants.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('drinkDetails.empty')} />
              ) : (
                // Drink variant list
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  {variants.map((variant) => (
                    <div
                      key={variant.drinkDetailId}
                      className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 last:border-b-0"
                    >
                      {/* Variant size and price */}
                      <div className="flex min-w-0 items-center gap-4">
                        <Tag className="m-0! min-w-10 text-center">{variant.size}</Tag>

                        <Typography.Text strong>{formatPrice(variant.price)}</Typography.Text>
                      </div>

                      {/* Edit and delete actions for OWNER and MANAGER */}
                      {!isStaff && (onEdit || onDelete) && (
                        <div className="flex items-center gap-1">
                          {onEdit && (
                            <Button
                              type="text"
                              shape="circle"
                              size="small"
                              icon={<EditOutlined />}
                              disabled={!isActive || detailLoading}
                              onClick={() => onEdit(variant)}
                            />
                          )}

                          {onDelete && (
                            <Button
                              danger
                              type="text"
                              shape="circle"
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => onDelete(variant)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drink status */}
            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
              <div>
                <div className="text-sm text-gray-500">{t('drinks.status')}</div>

                <Tag color={isActive ? 'green' : 'default'} className="mt-1 mr-0">
                  {selected.status ?? '—'}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Spin>
    </Drawer>
  );
}
