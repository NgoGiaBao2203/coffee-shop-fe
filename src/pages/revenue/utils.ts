import type { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

// ALL = every period (no date filter); the others pick one day / week / month / year
export type FilterType = 'ALL' | PeriodType;
export type PeriodType = 'DATE' | 'WEEK' | 'MONTH' | 'YEAR';

const DATE_FORMAT = 'YYYY-MM-DD';

const UNIT_BY_TYPE = {
  DATE: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
} as const;

// e.g. doanh-thu_20261101_20261130.xlsx, no dates = doanh-thu_tat-ca.xlsx (same as the BE name)
export function toExportFileName(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return 'doanh-thu_tat-ca.xlsx';
  const start = startDate ? startDate.replaceAll('-', '') : 'batdau';
  const end = endDate ? endDate.replaceAll('-', '') : 'hientai';
  return `doanh-thu_${start}_${end}.xlsx`;
}

// BE only accepts startDate - endDate (yyyy-MM-dd); the `vi` locale makes the week start on Monday
export function toDateRange(type: PeriodType, value: Dayjs) {
  const unit = UNIT_BY_TYPE[type];
  const date = value.locale('vi');
  return {
    startDate: date.startOf(unit).format(DATE_FORMAT),
    endDate: date.endOf(unit).format(DATE_FORMAT),
  };
}
