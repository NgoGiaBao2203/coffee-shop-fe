import type { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

export type FilterType = 'DATE' | 'WEEK' | 'MONTH' | 'YEAR';

const DATE_FORMAT = 'YYYY-MM-DD';

const UNIT_BY_TYPE = {
  DATE: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
} as const;

// BE only accepts startDate - endDate (yyyy-MM-dd); the `vi` locale makes the week start on Monday
export function toDateRange(type: FilterType, value: Dayjs) {
  const unit = UNIT_BY_TYPE[type];
  const date = value.locale('vi');
  return {
    startDate: date.startOf(unit).format(DATE_FORMAT),
    endDate: date.endOf(unit).format(DATE_FORMAT),
  };
}
