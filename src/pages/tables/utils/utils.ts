/** Visual styles for table cards, grouped by table status. */
export interface TableCardStyle {
  card: string;
  dot: string;
}

const STATUS_STYLES: Record<number, TableCardStyle> = {
  1: {
    card: 'bg-emerald-50 border-emerald-400 text-emerald-700 hover:bg-emerald-100',
    dot: 'bg-emerald-500',
  },
  2: {
    card: 'bg-red-50 border-red-400 text-red-700 hover:bg-red-100',
    dot: 'bg-red-500',
  },
  3: {
    card: 'bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100',
    dot: 'bg-amber-500',
  },
};

const DEFAULT_STYLE: TableCardStyle = {
  card: 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100',
  dot: 'bg-gray-400',
};

export function getTableCardStyle(status: number): TableCardStyle {
  return STATUS_STYLES[status] ?? DEFAULT_STYLE;
}

/** Returns the translation key for a table status. */
export function tableStatusKey(status: number): string {
  switch (status) {
    case 1:
      return 'tables.statusOptions.available';
    case 2:
      return 'tables.statusOptions.occupied';
    case 3:
      return 'tables.statusOptions.reserved';
    default:
      return 'tables.statusOptions.unknown';
  }
}
