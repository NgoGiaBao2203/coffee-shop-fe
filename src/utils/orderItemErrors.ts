import axios from 'axios';
import { RESPONSE_CODE } from '@/constants/messages';

const ITEM_QUANTITY_FIELD = /^items\[(\d+)]\.quantity$/;

export interface OrderItemError {
  index: number;
  code: string;
}

// Read the items[i].quantity errors of an ER008 response from the invoice create/edit APIs
export function getOrderItemErrors(error: unknown): OrderItemError[] {
  if (!axios.isAxiosError(error) || error.response?.data?.code !== RESPONSE_CODE.INVALID_REQUEST) {
    return [];
  }

  const details: { field?: string; message?: string }[] = Array.isArray(
    error.response.data.errorDetails,
  )
    ? error.response.data.errorDetails
    : [];

  return details.flatMap(({ field, message }) => {
    const match = ITEM_QUANTITY_FIELD.exec(field ?? '');
    return match && message ? [{ index: Number(match[1]), code: message }] : [];
  });
}
