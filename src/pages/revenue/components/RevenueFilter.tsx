import { Select, DatePicker, Button } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { SearchInput } from '@/components/search/SearchInput';
import type { FilterType } from '../hooks/useRevenues';

interface SelectOption {
  value: string | number;
  label: string;
}

interface RevenueFilterProps {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  selectedDate?: string;
  setSelectedDate: (date?: string) => void;
  selectedMonth?: number;
  setSelectedMonth: (month?: number) => void;
  selectedYear?: number;
  setSelectedYear: (year?: number) => void;
  isOwner: boolean;
  currentShopId?: string;
  shopOptions: SelectOption[];
  optionsLoading: boolean;
  onShopFilter: (shopId: string) => void;
  onApplyFilter: () => void;
  onResetFilter: () => void;
  onSearch: (search: string) => void;
  searchLoading: boolean;
  monthOptions: SelectOption[];
  yearOptions: SelectOption[];
}

export function RevenueFilter({
  filterType,
  setFilterType,
  selectedDate,
  setSelectedDate,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  isOwner,
  currentShopId,
  shopOptions,
  optionsLoading,
  onShopFilter,
  onApplyFilter,
  onResetFilter,
  onSearch,
  searchLoading,
  monthOptions,
  yearOptions,
}: RevenueFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
      <div className="w-full md:flex-1 md:max-w-md min-w-[200px]">
        <SearchInput
          onSearch={onSearch}
          loading={searchLoading}
          placeholder={t('revenues.searchPlaceholder')}
        />
      </div>

      {/* Filter Group: Responsive layout for Mobile/Tablet/Desktop */}
      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
        {/* Filter Type */}
        <Select
          value={filterType}
          onChange={(val: FilterType) => setFilterType(val)}
          options={[
            { value: 'DATE', label: t('revenues.filterDateType') },
            { value: 'MONTH', label: t('revenues.filterMonthType') },
            { value: 'YEAR', label: t('revenues.filterYearType') },
          ]}
          className="w-[calc(50%-4px)] sm:w-28"
          size="middle"
        />

        {/* Date Picker */}
        {filterType === 'DATE' && (
          <DatePicker
            format="DD/MM/YYYY"
            placeholder="dd/mm/yyyy"
            value={selectedDate ? dayjs(selectedDate) : null}
            onChange={(date) => setSelectedDate(date ? date.format('YYYY-MM-DD') : undefined)}
            className="w-[calc(50%-4px)] sm:w-32"
          />
        )}

        {/* Month & Year Selectors */}
        {(filterType === 'MONTH' || filterType === 'YEAR') && (
          <>
            {filterType === 'MONTH' && (
              <Select
                allowClear
                placeholder={t('revenues.selectMonthPlaceholder')}
                options={monthOptions}
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val)}
                className="w-[calc(50%-4px)] sm:w-32"
              />
            )}
            <Select
              allowClear
              placeholder={t('revenues.selectYearPlaceholder')}
              options={yearOptions}
              value={selectedYear}
              onChange={(val) => setSelectedYear(val)}
              className="w-[calc(50%-4px)] sm:w-28"
            />
          </>
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

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto mt-1 sm:mt-0">
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={onApplyFilter}
            className="flex-1 sm:flex-none"
          >
            {t('revenues.filterApply')}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onResetFilter} className="flex-1 sm:flex-none">
            {t('revenues.filterReset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
