import { Select, DatePicker, Button, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Dayjs } from 'dayjs';
import { SearchInput } from '@/components/search/SearchInput';
import type { FilterType } from '../utils';

interface SelectOption {
  value: string;
  label: string;
}

const PICKER_BY_TYPE = {
  DATE: { picker: 'date', format: 'DD/MM/YYYY' },
  WEEK: { picker: 'week', format: undefined },
  MONTH: { picker: 'month', format: 'MM/YYYY' },
  YEAR: { picker: 'year', format: 'YYYY' },
} as const;

interface RevenueFilterProps {
  readonly filterType: FilterType;
  readonly onFilterTypeChange: (type: FilterType) => void;
  readonly pickedDate: Dayjs | null;
  readonly onPickedDateChange: (value: Dayjs | null) => void;
  readonly isOwner: boolean;
  readonly currentShopId?: string;
  readonly shopOptions: SelectOption[];
  readonly optionsLoading: boolean;
  readonly onShopFilter: (shopId: string) => void;
  readonly onResetFilter: () => void;
  readonly onSearch: (search: string) => void;
  readonly searchLoading: boolean;
}

export function RevenueFilter({
  filterType,
  onFilterTypeChange,
  pickedDate,
  onPickedDateChange,
  isOwner,
  currentShopId,
  shopOptions,
  optionsLoading,
  onShopFilter,
  onResetFilter,
  onSearch,
  searchLoading,
}: RevenueFilterProps) {
  const { t } = useTranslation();
  // "All time" has no period to pick
  const pickerConfig = filterType === 'ALL' ? null : PICKER_BY_TYPE[filterType];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
      <div className="w-full md:flex-1 md:max-w-md min-w-[200px]">
        <SearchInput
          onSearch={onSearch}
          loading={searchLoading}
          placeholder={t('revenues.searchPlaceholder')}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
        <Select
          value={filterType}
          onChange={onFilterTypeChange}
          options={[
            { value: 'ALL', label: t('revenues.filterAllType') },
            { value: 'DATE', label: t('revenues.filterDateType') },
            { value: 'WEEK', label: t('revenues.filterWeekType') },
            { value: 'MONTH', label: t('revenues.filterMonthType') },
            { value: 'YEAR', label: t('revenues.filterYearType') },
          ]}
          className="w-[calc(50%-4px)] sm:w-36"
          size="middle"
        />

        {/* vi_VN locale: the week starts on Monday, same as the range sent to the BE */}
        {pickerConfig && (
          <ConfigProvider locale={viVN}>
            <DatePicker
              key={filterType}
              picker={pickerConfig.picker}
              format={pickerConfig.format}
              value={pickedDate}
              onChange={onPickedDateChange}
              className="w-[calc(50%-4px)] sm:w-36"
            />
          </ConfigProvider>
        )}

        {/* Branch / Shop Filter */}
        {isOwner && (
          <Select
            allowClear
            placeholder={t('revenues.filterShop')}
            options={shopOptions}
            loading={optionsLoading}
            value={currentShopId || undefined}
            onChange={(val) => onShopFilter(val ?? '')}
            className="w-full sm:w-36"
          />
        )}

        {/* Picking a date filters right away; reset clears every filter */}
        <Button
          icon={<ReloadOutlined />}
          onClick={onResetFilter}
          className="w-full sm:w-auto mt-1 sm:mt-0"
        >
          {t('revenues.filterReset')}
        </Button>
      </div>
    </div>
  );
}
