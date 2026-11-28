import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableItem } from '../types';
import { getTableCardStyle, TABLE_STATUS_ACTIONS, tableStatusKey } from '../utils/utils';
import { DeleteIconButton, EditIconButton } from '@/components/button/ActionIconButtons';

interface TableCardProps {
  readonly record: TableItem;
  readonly onClick?: (record: TableItem) => void;
  readonly onEdit?: (record: TableItem) => void;
  readonly onDelete?: (record: TableItem) => void;
  // Omitted = no quick status buttons; the status is shown as text instead
  readonly onStatusChange?: (record: TableItem, status: number) => void;
  readonly statusLoading?: boolean;
}

export function TableCard({
  record,
  onClick,
  onEdit,
  onDelete,
  onStatusChange,
  statusLoading = false,
}: TableCardProps) {
  const { t } = useTranslation();
  const style = getTableCardStyle(record.status);

  return (
    <div className="@container group relative flex aspect-square w-full flex-col rounded-2xl border border-slate-300 bg-white text-slate-800 shadow-sm transition-shadow duration-200 hover:border-slate-400 hover:shadow-md">
      <button
        type="button"
        aria-label={`${t('tables.tableNumber')}: ${record.tableNumber}`}
        className="flex min-h-0 w-full flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-2 text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        onClick={() => onClick?.(record)}
      >
        {/* Table illustration (tabletop + four seats); sized in cqw so it scales with the card */}
        <span className="relative flex size-[44cqw] items-center justify-center">
          <span
            className={`absolute -top-[1.5cqw] left-1/2 h-[3cqw] w-[13cqw] -translate-x-1/2 rounded-full ${style.dot} opacity-70`}
          />
          <span
            className={`absolute -bottom-[1.5cqw] left-1/2 h-[3cqw] w-[13cqw] -translate-x-1/2 rounded-full ${style.dot} opacity-70`}
          />
          <span
            className={`absolute -left-[1.5cqw] top-1/2 h-[13cqw] w-[3cqw] -translate-y-1/2 rounded-full ${style.dot} opacity-70`}
          />
          <span
            className={`absolute -right-[1.5cqw] top-1/2 h-[13cqw] w-[3cqw] -translate-y-1/2 rounded-full ${style.dot} opacity-70`}
          />

          <span
            className={`flex size-[32cqw] items-center justify-center rounded-[7cqw] border-2 shadow-sm transition-transform duration-200 group-hover:scale-105 ${style.card}`}
          >
            <span className="select-none text-[12cqw] font-bold leading-none">
              {record.tableNumber}
            </span>
          </span>
        </span>

        {/* Without quick buttons the status is shown as text */}
        {!onStatusChange && (
          <span className="max-w-full truncate rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:text-xs @2xs:px-3 @2xs:py-1 @2xs:text-sm">
            {t(tableStatusKey(record.status))}
          </span>
        )}
      </button>

      {/* Quick status change: current status is tinted, the others are neutral outlined */}
      {onStatusChange && (
        <div className="grid grid-cols-3 gap-1 px-2 pb-2 @2xs:gap-1.5 @2xs:px-3 @2xs:pb-3">
          {TABLE_STATUS_ACTIONS.map((action) => {
            const isCurrent = record.status === action.status;
            return (
              <Tooltip key={action.status} title={t(action.labelKey)}>
                <Button
                  size="small"
                  block
                  variant="outlined"
                  aria-pressed={isCurrent}
                  loading={statusLoading && isCurrent}
                  disabled={statusLoading && !isCurrent}
                  className={`rounded-lg! px-1! text-xs! @2xs:h-8! @2xs:text-sm! @sm:h-9! @sm:text-base! ${
                    isCurrent
                      ? `font-semibold ${action.activeClassName}`
                      : `border-slate-200! text-slate-500! ${action.hoverClassName}`
                  }`}
                  onClick={() => onStatusChange(record, action.status)}
                >
                  <span className="truncate">{t(action.shortLabelKey)}</span>
                </Button>
              </Tooltip>
            );
          })}
        </div>
      )}

      {/* Edit/delete stay visible; kept separate from the details button. Controls grow with the card (@2xs >= 288px, @sm >= 384px) */}
      {(onEdit || onDelete) && (
        <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-0.5 @2xs:right-2.5 @2xs:top-2.5 @2xs:gap-1">
          {onEdit && (
            <EditIconButton
              className="flex items-center justify-center! bg-white/80 hover:bg-white! text-inherit shadow-xs @2xs:size-8! @sm:size-9!"
              iconClassName="text-[13px] @2xs:text-base @sm:text-lg"
              onClick={() => onEdit(record)}
            />
          )}
          {onDelete && (
            <DeleteIconButton
              className="flex items-center justify-center! bg-white/80 hover:bg-red-50! shadow-xs @2xs:size-8! @sm:size-9!"
              iconClassName="text-[13px] @2xs:text-base @sm:text-lg"
              onClick={() => onDelete(record)}
            />
          )}
        </div>
      )}
    </div>
  );
}
