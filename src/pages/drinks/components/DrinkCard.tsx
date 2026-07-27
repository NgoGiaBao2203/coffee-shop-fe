import { Card, Typography } from 'antd';
import type { DrinkItem } from '../types';

interface Props {
  record: DrinkItem;
  onClick?: (record: DrinkItem) => void;
}

export function DrinkCard({ record, onClick }: Props) {
  return (
    <Card
      hoverable
      onClick={() => onClick?.(record)}
      bodyStyle={{ padding: 12 }}
      className="rounded-md"
      style={{ border: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}
    >
      <div className="flex flex-col items-start gap-2">
        <div className="w-full flex items-center justify-center">
          {record.imageUrl ? (
            <img
              src={record.imageUrl}
              alt="drink"
              style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8 }}
            />
          ) : (
            <div style={{ width: 160, height: 160, background: '#f3f4f6', borderRadius: 8 }} />
          )}
        </div>

        <div className="w-full flex flex-col">
          <Typography.Title level={5} className="mb-0!">
            {record.drinkName}
          </Typography.Title>
          <div className="mt-1">
            <span className="text-green-600 font-semibold">{record.price}</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {record.size} • {record.status}
          </div>
        </div>
      </div>
    </Card>
  );
}
