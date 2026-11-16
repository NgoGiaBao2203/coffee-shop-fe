import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Spin } from 'antd';
import { OptionTagGroup } from './OptionTagGroup';

// Show the filter box once the grid gets long
const FILTER_MIN_OPTIONS = 12;

interface TablePickerOption {
  value: string;
  label: string;
}

interface Props {
  readonly options: TablePickerOption[];
  readonly value?: string;
  readonly loading?: boolean;
  readonly onChange: (tableId: string) => void;
}

// Grid of selectable table tiles (replaces a dropdown so the free tables are visible at a glance)
export function TablePicker({ options, value, loading, onChange }: Props) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');

  const visibleOptions = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return text ? options.filter((option) => option.label.toLowerCase().includes(text)) : options;
  }, [options, keyword]);

  return (
    <div className="flex shrink-0 flex-col gap-1.5 rounded-lg bg-gray-50 p-2">
      {options.length > FILTER_MIN_OPTIONS && (
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={t('order.tableFilterPlaceholder')}
        />
      )}
      <Spin spinning={loading}>
        {visibleOptions.length === 0 && !loading ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('order.tableEmpty')} />
        ) : (
          // Clicking the selected table again returns null, which keeps the selection
          <OptionTagGroup
            variant="tile"
            value={value}
            onChange={(tableId) => tableId && onChange(tableId)}
            options={visibleOptions}
            className="grid! max-h-[6.5rem] min-h-9 grid-cols-4 gap-1.5 overflow-y-auto pr-1 xl:grid-cols-6"
          />
        )}
      </Spin>
    </div>
  );
}
