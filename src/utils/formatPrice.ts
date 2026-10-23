export function formatPrice(value: number | string | null | undefined): string {
  if (value == null || String(value).trim() === '') return '—';

  const amount = Number(String(value).replaceAll(',', ''));
  if (!Number.isFinite(amount)) return '—';

  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(amount)}đ`;
}
