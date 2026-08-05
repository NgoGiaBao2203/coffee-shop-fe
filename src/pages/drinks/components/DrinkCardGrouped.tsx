import { Card, Typography, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { DrinkItem } from '../types';

// Component props interface
interface Props {
  record: DrinkItem;
  onClick?: (record: DrinkItem) => void;
  onDelete?: (record: DrinkItem) => void;
  isStaff?: boolean;
}

// Component to display drink card with starting price
export function DrinkCardGrouped({ record, onClick, onDelete, isStaff = false }: Props) {
  const { t } = useTranslation();

  // Calculate lowest price among available size variants
  const lowest = record.variants?.reduce((acc, v) => {
    const num = Number(String(v.price).replace(/[^0-9.-]+/g, '')) || 0;
    return acc === 0 || num < acc ? num : acc;
  }, 0);

  // Format display price text
  const priceText = lowest
    ? `${t('common.from')} ${lowest.toLocaleString('vi-VN')}đ`
    : (record.variants?.[0]?.price ?? '—');

  // Fallback image URL when drink image fails to load or is null
  const fallbackImage = 'https://placehold.co/400x400?text=No+Image';

  return (
    <Card
      hoverable
      onClick={() => onClick?.(record)}
      cover={
        /* Square aspect ratio image container */
        <div className="w-full aspect-[4/3] overflow-hidden bg-gray-50 rounded-t-lg">
          <img
            alt="cover"
            src={record.imageUrl || fallbackImage}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (el.src !== fallbackImage) {
                el.src = fallbackImage;
              }
            }}
          />
        </div>
      }
      styles={{ body: { padding: '8px 10px' } }}
      style={{
        width: '100%',
        border: '1px solid rgba(0,0,0,0.06)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div className="flex flex-col justify-between gap-2">
        {/* Drink Name Display Row - Full text wrapping up to 2 lines */}
        <div>
          <Typography.Paragraph
            ellipsis={{ rows: 2 }}
            className="mb-0! text-xs font-semibold leading-snug text-gray-800"
            title={record.drinkName}
          >
            {record.drinkName}
          </Typography.Paragraph>
        </div>

        {/* Bottom Price & Delete Button Row */}
        <div className="flex items-end justify-between gap-1 mt-1">
          <div>
            <span className="text-green-600 font-semibold text-xs">{priceText}</span>
          </div>

          {/* Delete Button */}
          {!isStaff && onDelete && (
            <Button
              danger
              type="text"
              shape="circle"
              size="small"
              className="flex items-center justify-center min-w-[24px] w-6 h-6"
              icon={<DeleteOutlined style={{ fontSize: 13 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
