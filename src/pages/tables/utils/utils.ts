import axios from 'axios';
import { RESPONSE_CODE } from '@/constants/messages';
import { getResponseMessage } from '@/utils/getResponseMessage';

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

interface TableApiErrorDetail {
  field?: string | null;
  errorCode?: string;
  message?: string | null;
}

interface TableApiErrorResponse {
  code?: string;
  message?: string;
  errorDetails?: TableApiErrorDetail[] | null;
}

/** Returns the delete error message handled by the table mutation hook. */
export function getTableDeleteErrorMessage(
  error: unknown,
  pendingInvoicesMessage: string,
): string | undefined {
  if (!axios.isAxiosError<TableApiErrorResponse>(error)) return undefined;

  const response = error.response?.data;
  if (!response) return undefined;
  if (response.code === RESPONSE_CODE.NOT_FOUND) {
    return getResponseMessage(RESPONSE_CODE.NOT_FOUND);
  }
  if (
    typeof response.message === 'string' &&
    response.message.toLowerCase().includes('pending invoices')
  ) {
    return pendingInvoicesMessage;
  }
  return response.code ? getResponseMessage(response.code) : undefined;
}

export interface TableFormApiError {
  fieldErrors: Array<{ name: string; errors: string[] }>;
  message?: string;
}

const TABLE_FORM_FIELDS = new Set(['tableNumber', 'description', 'status', 'shopId']);

/** Converts a backend error response into form errors or a general message. */
export function getTableFormApiError(
  error: unknown,
  numberConflictMessage: string,
  pendingInvoicesMessage: string,
): TableFormApiError {
  if (!axios.isAxiosError(error)) {
    // Local errors are already handled by the mutation hook; avoid a second notification here.
    return { fieldErrors: [] };
  }

  const response = error.response?.data as TableApiErrorResponse | undefined;
  const details = Array.isArray(response?.errorDetails) ? response.errorDetails : [];
  const errorMessages = [response?.message, ...details.map((detail) => detail.message)]
    .filter((message): message is string => typeof message === 'string')
    .map((message) => message.toLowerCase());
  if (errorMessages.some((message) => message.includes('pending invoices'))) {
    return { fieldErrors: [], message: pendingInvoicesMessage };
  }

  const isTableNumberConflict =
    response?.code === RESPONSE_CODE.CONFLICT ||
    details.some((detail) => detail.errorCode === RESPONSE_CODE.CONFLICT) ||
    errorMessages.some(
      (message) => message.includes('table number') && message.includes('already exists'),
    );

  if (isTableNumberConflict) {
    return {
      fieldErrors: [{ name: 'tableNumber', errors: [numberConflictMessage] }],
      message: numberConflictMessage,
    };
  }

  const fieldErrors = details
    .filter(
      (detail): detail is TableApiErrorDetail & { field: string } =>
        Boolean(detail.field) && TABLE_FORM_FIELDS.has(detail.field!),
    )
    .map((detail) => ({
      name: detail.field,
      errors: [
        detail.message ||
          (detail.errorCode
            ? getResponseMessage(detail.errorCode)
            : getResponseMessage(response?.code ?? '')),
      ],
    }));

  const unboundDetail =
    response?.code === RESPONSE_CODE.INVALID_REQUEST
      ? details.find(
          (item) =>
            (!item.field || !TABLE_FORM_FIELDS.has(item.field)) && (item.message || item.errorCode),
        )
      : undefined;
  const description =
    unboundDetail?.message ||
    (unboundDetail?.errorCode ? getResponseMessage(unboundDetail.errorCode) : undefined) ||
    (fieldErrors.length === 0 ? details.find((item) => item.message)?.message : undefined) ||
    (response?.code === RESPONSE_CODE.INVALID_REQUEST && fieldErrors.length === 0
      ? response.message || getResponseMessage(RESPONSE_CODE.INVALID_REQUEST)
      : undefined);

  return { fieldErrors, message: description };
}
