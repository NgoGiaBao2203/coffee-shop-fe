import { Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableItem } from '../types';
import { getTableCardStyle, tableStatusKey } from '../utils/utils';

interface TableCardProps {
  record: TableItem;
  onClick?: (record: TableItem) => void;
  onEdit?: (record: TableItem) => void;
  onDelete?: (record: TableItem) => void;
}

export function TableCard({ record, onClick, onEdit, onDelete }: TableCardProps) {
  const { t } = useTranslation();
  const style = getTableCardStyle(record.status);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${t('tables.tableNumber')}: ${record.tableNumber}`}
      className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      onClick={() => onClick?.(record)}
      onKeyDown={(e) => {
        // Only trigger when the card itself is focused
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(record);
        }
      }}
    >
      {/* Build a simple table illustration with a round tabletop and four seats. */}
      <div className="relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
        <span
          className={`absolute -top-1 left-1/2 h-1.5 w-4.5 -translate-x-1/2 rounded-full ${style.dot} opacity-70`}
        />
        <span
          className={`absolute -bottom-1 left-1/2 h-1.5 w-4.5 -translate-x-1/2 rounded-full ${style.dot} opacity-70`}
        />
        <span
          className={`absolute -left-1 top-1/2 h-4.5 w-1.5 -translate-y-1/2 rounded-full ${style.dot} opacity-70`}
        />
        <span
          className={`absolute -right-1 top-1/2 h-4.5 w-1.5 -translate-y-1/2 rounded-full ${style.dot} opacity-70`}
        />

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border-[2px] shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11 ${style.card}`}
        >
          <span className="select-none text-sm font-bold sm:text-base">{record.tableNumber}</span>
        </div>
      </div>

      <span className="max-w-full truncate rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:text-xs">
        {t(tableStatusKey(record.status))}
      </span>

      {/* Edit and Delete action buttons at bottom-right corner */}
      {(onEdit || onDelete) && (
        <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {onEdit && (
            <Button
              type="text"
              shape="circle"
              size="small"
              aria-label={t('form.edit')}
              className="flex items-center justify-center! bg-white/80 hover:bg-white! text-inherit shadow-xs"
              icon={<EditOutlined style={{ fontSize: 13 }} />}
              onClick={(e) => {
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
              aria-label={t('form.delete')}
              className="flex items-center justify-center! bg-white/80 hover:bg-red-50! shadow-xs"
              icon={<DeleteOutlined style={{ fontSize: 13 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
