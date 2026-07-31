import { Card, Typography, Button } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

// Interface for individual size variant
export interface Variant {
  drinkId: string;
  size: string;
  price: string;
}

// Interface for grouped drink record
export interface GroupedDrink {
  drinkName: string;
  imageUrl?: string | null;
  drinkCategoryId?: string | null;
  id?: string;
  status?: string | null;
  isDeleted?: boolean;
  variants: Variant[];
}

interface Props {
  record: GroupedDrink;
  onClick?: (record: GroupedDrink) => void;
  onEdit?: (record: GroupedDrink) => void;
  onDelete?: (record: GroupedDrink) => void;
  isStaff?: boolean;
}

export function DrinkCardGrouped({ record, onClick, onEdit, onDelete, isStaff = false }: Props) {
  // Find the lowest price among available size variants
  const lowest = record.variants.reduce((acc, v) => {
    const num = Number(String(v.price).replace(/[^0-9.-]+/g, '')) || 0;
    return acc === 0 || num < acc ? num : acc;
  }, 0);

  // Format display price text
  const priceText = lowest
    ? `Từ ${lowest.toLocaleString('vi-VN')}đ`
    : (record.variants[0]?.price ?? '—');

  // Fallback image URL when image fails to load
  const fallbackImage = 'https://placehold.co/400x300?text=No+Image';

  return (
    <Card
      hoverable
      onClick={() => onClick?.(record)}
      cover={
        /* Drink Image Cover */
        <img
          alt="cover"
          src={record.imageUrl || fallbackImage}
          style={{ height: 220, width: '100%', objectFit: 'cover' }}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            if (el.src !== fallbackImage) {
              el.src = fallbackImage;
            }
          }}
        />
      }
      styles={{ body: { padding: 12 } }}
      style={{ border: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}
    >
      {/* Drink Name & Action Icons (Edit + Delete) */}
      <div className="flex items-center justify-between gap-2">
        <Typography.Title level={5} className="mb-0! flex-1 truncate">
          {record.drinkName}
        </Typography.Title>

        {/* Hide action icons if user role is STAFF */}
        {!isStaff && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Edit button icon */}
            {onEdit && (
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<EditOutlined style={{ color: '#000' }} />}
                onClick={(e) => {
                  e.stopPropagation(); // Stop opening detail drawer
                  onEdit(record);
                }}
              />
            )}

            {/* Delete button icon */}
            {onDelete && (
              <Button
                danger
                type="text"
                shape="circle"
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation(); // Stop opening detail drawer
                  onDelete(record);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Price display */}
      <div className="mt-1">
        <span className="text-green-600 font-semibold">{priceText}</span>
      </div>

      {/* Variant count */}
      <div className="text-sm text-gray-500 mt-1">{record.variants?.length ?? 1} Tổng size</div>
    </Card>
  );
}
