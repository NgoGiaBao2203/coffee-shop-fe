import { Card, Typography, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { resolveImageUrl } from '@/utils/image';
import type { DrinkItem } from '../types';

interface Props {
  record: DrinkItem;
  onClick?: (record: DrinkItem) => void;
  onDelete?: (record: DrinkItem) => void;
  isStaff?: boolean;
}

export function DrinkCardGrouped({ record, onClick, onDelete, isStaff = false }: Props) {
  const fallbackImage = 'https://placehold.co/400x300?text=No+Image';
  const displayImage = resolveImageUrl(record.imageUrl) || fallbackImage;

  return (
    <Card
      hoverable
      onClick={() => onClick?.(record)}
      className="drink-card group transition-all duration-200 hover:shadow-md"
      cover={
        <div
          className="w-full aspect-[4/3] overflow-hidden bg-gray-50 relative"
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
          minHeight: '76px',
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
      {/* Information below the image. */}
      <div className="flex flex-col justify-between h-full gap-1">
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: false }}
          className="mb-0! text-sm font-semibold text-gray-800 leading-snug"
          title={record.drinkName}
        >
          {record.drinkName}
        </Typography.Paragraph>

        {!isStaff && onDelete && (
          <div className="flex items-center justify-end">
            <Button
              danger
              type="text"
              shape="circle"
              size="small"
              className="flex items-center justify-center opacity-70 group-hover:opacity-100 hover:bg-red-50"
              icon={<DeleteOutlined style={{ fontSize: 14 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
