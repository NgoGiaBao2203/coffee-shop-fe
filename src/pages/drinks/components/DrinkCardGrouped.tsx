import { Card, Typography, Button, Tag } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { resolveImageUrl } from '@/utils/image';
import type { DrinkItem } from '../types';
import { formatPrice } from '@/utils/formatPrice';

interface Props {
  readonly record: DrinkItem;
  readonly onClick?: (record: DrinkItem) => void;
  readonly onDelete?: (record: DrinkItem) => void;
  readonly onEdit?: (record: DrinkItem) => void;
  readonly isStaff?: boolean;
}

export function DrinkCardGrouped({ record, onClick, onDelete, onEdit, isStaff = false }: Props) {
  const { t } = useTranslation();

  // Fallback image when drink image is unavailable
  const fallbackImage = 'https://placehold.co/400x300?text=No+Image';

  // Resolve drink image URL for display
  const displayImage = resolveImageUrl(record.imageUrl) || fallbackImage;

  // Get the lowest price from all drink variants
  const startingPrice = record.variants?.reduce<number | undefined>((lowest, variant) => {
    const price = Number(String(variant.price).replaceAll(',', ''));

    if (!Number.isFinite(price)) return lowest;

    return lowest === undefined ? price : Math.min(lowest, price);
  }, undefined);

  // Check current drink selling status
  const isActive =
    record.status === t('drinks.statusActive') ||
    record.status === 'ACTIVE' ||
    record.status === '1';

  return (
    <Card
      hoverable
      onClick={() => onClick?.(record)}
      className="drink-card group transition-all duration-200 hover:shadow-md"
      cover={
        // Drink image
        <div
          className="mx-auto w-4/5 aspect-square overflow-hidden bg-gray-50 relative"
          style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
          <img
            alt={record.drinkName}
            src={displayImage}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;

              if (el.src !== fallbackImage) {
                el.src = fallbackImage;
              }
            }}
          />
        </div>
      }
      styles={{
        body: {
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '104px',
        },
      }}
      style={{
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
        background: '#fff',
      }}
    >
      {/* Information below the image */}
      <div className="flex flex-col justify-between h-full gap-1">
        {/* Drink name */}
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: false }}
          className="mb-0! text-sm font-semibold text-gray-800 leading-snug"
          title={record.drinkName}
        >
          {record.drinkName}
        </Typography.Paragraph>

        {/* Starting price and drink status */}
        <div className="flex flex-wrap items-center justify-between gap-1">
          <Typography.Text strong className="text-sm text-green-700">
            {startingPrice === undefined
              ? '—'
              : `${t('drinks.startingPrice')} ${formatPrice(startingPrice)}`}
          </Typography.Text>

          <Tag color={isActive ? 'green' : 'default'} className="m-0!">
            {record.status || '—'}
          </Tag>
        </div>

        {/* Edit and delete actions for OWNER and MANAGER */}
        {!isStaff && (onEdit || onDelete) && (
          <div className="flex items-center justify-end gap-1">
            {onEdit && (
              <Button
                type="text"
                shape="circle"
                size="small"
                className="flex items-center justify-center opacity-70 group-hover:opacity-100 hover:bg-blue-50 text-blue-600"
                icon={<EditOutlined style={{ fontSize: 14 }} />}
                onClick={(e) => {
                  // Prevent opening detail drawer when editing
                  e.stopPropagation();
                  onEdit(record);
                }}
              />
            )}

            {onDelete && (
              <Button
                danger
                type="text"
                shape="circle"
                size="small"
                className="flex items-center justify-center opacity-70 group-hover:opacity-100 hover:bg-red-50"
                icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                onClick={(e) => {
                  // Prevent opening detail drawer when deleting
                  e.stopPropagation();
                  onDelete(record);
                }}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
