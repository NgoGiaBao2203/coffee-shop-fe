import {
  Table,
  Button,
  Popconfirm,
  Space,
  Pagination,
  Select,
  Empty,
  type TableColumnType,
  type TablePaginationConfig,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

/** Extended column type — adds `color` (text color for header + cells) on top of Ant Design's TableColumnType */
export interface AppColumnType<T> extends TableColumnType<T> {
  color?: string;
}

export interface TableGridProps<T extends object> {
  /** Dynamic column definitions — use AppColumnType<T> to set color and width per column */
  columns: AppColumnType<T>[];
  dataSource: T[];
  loading?: boolean;
  rowKey: string | ((record: T) => string);
  /** Custom empty-state text */
  emptyText?: ReactNode;
  /** Called with the row record when the edit button is clicked */
  onEdit?: (record: T) => void;
  /** Called with the row record after the delete popconfirm is confirmed */
  onDelete?: (record: T) => void;
  /** Total records count for server-side pagination */
  total?: number;
  /** Current page number (controlled) */
  currentPage?: number;
  /** Current page size (controlled) */
  currentPageSize?: number;
  /** Called when page or page size changes (enables server-side pagination) */
  onPageChange?: (page: number, pageSize: number) => void;
  /** Override auto-computed horizontal scroll width (px). Auto-computed from column widths by default. */
  scrollX?: number | string;
  /** Called when a data row is clicked */
  onRowClick?: (record: T) => void;
  pagination?: TablePaginationConfig | false;
}

export function TableGrid<T extends object>({
  columns,
  dataSource,
  loading = false,
  rowKey,
  emptyText,
  onEdit,
  onDelete,
  total,
  currentPage,
  currentPageSize,
  onPageChange,
  scrollX,
  onRowClick,
  pagination,
}: TableGridProps<T>) {
  const { t } = useTranslation();

  const actionColumn: TableColumnType<T> = {
    key: '_actions',
    title: t('table.actions'),
    width: 100,
    align: 'center',
    fixed: 'right',
    render: (_, record) => (
      <Space size="small">
        {onEdit && (
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(record);
            }}
          />
        )}
        {onDelete && (
          <Popconfirm
            title={t('table.deleteConfirmTitle')}
            description={t('table.deleteConfirmDesc')}
            onConfirm={() => onDelete(record)}
            okText={t('table.deleteOk')}
            cancelText={t('table.deleteCancel')}
            okButtonProps={{ danger: true }}
            placement="topRight"
            onPopupClick={(e) => e.stopPropagation()}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        )}
      </Space>
    ),
  };

  const pageSize = currentPageSize ?? 10;
  const pageSizeOptions = [10, 15, 20];

  const allColumns: AppColumnType<T>[] =
    onEdit || onDelete ? [...columns, actionColumn as AppColumnType<T>] : columns;

  // Apply color to header + cells for columns that define it
  const processedColumns: TableColumnType<T>[] = allColumns.map((col) => {
    const { color, ...rest } = col;
    if (!color) return rest as TableColumnType<T>;
    return {
      ...rest,
      onHeaderCell: () => ({ style: { color } }),
      onCell: () => ({ style: { color } }),
    } as TableColumnType<T>;
  });

  // Auto-compute scrollX from column widths; fallback 150px per column without explicit width
  const resolvedScrollX: number | string =
    scrollX ??
    allColumns.reduce((sum, col) => {
      if (typeof col.width === 'number') return sum + col.width;
      if (typeof col.width === 'string' && !Number.isNaN(Number(col.width)))
        return sum + Number(col.width);
      return sum + 150;
    }, 0);

  const showCustomPagination = pagination === undefined && (total !== undefined || onPageChange);

  return (
    <div className="table-grid-wrapper flex flex-col gap-2 w-full min-w-0">
      <Table<T>
        columns={processedColumns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination !== undefined ? pagination : false}
        locale={{ emptyText: <Empty description={emptyText} /> }}
        scroll={{ x: resolvedScrollX, y: 'calc(100vh - 330px)' }}
        onRow={(record) => ({
          onClick: (e) => {
            // Ignore clicks that originate from a button (edit / delete actions)
            if ((e.target as HTMLElement).closest('button')) return;
            onRowClick?.(record);
          },
          className: onRowClick ? 'cursor-pointer' : '',
        })}
        bordered
      />

      {showCustomPagination && (
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
          <span className="hidden sm:block sm:flex-1" />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            onChange={(page) => onPageChange?.(page, pageSize)}
          />
          <div className="sm:flex-1 flex justify-center sm:justify-end">
            <Select
              value={pageSize}
              onChange={(newSize) => onPageChange?.(1, newSize)}
              options={pageSizeOptions.map((s) => ({
                value: s,
                label: `${s} / ${t('table.perPage')}`,
              }))}
              style={{ width: 110 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
