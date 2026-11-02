import { RESPONSE_CODE } from '@/constants/messages';
import { getApiErrorResponse } from '@/utils/apiError';

const ITEM_QUANTITY_FIELD = /^items\[(\d+)]\.quantity$/;

export interface OrderItemError {
  index: number;
  code: string;
}

// Read the items[i].quantity errors of an ER008 response from the invoice create/edit APIs
export function getOrderItemErrors(error: unknown): OrderItemError[] {
  const response = getApiErrorResponse(error);

  if (response?.code !== RESPONSE_CODE.INVALID_REQUEST) return [];

  return (response.errorDetails ?? []).flatMap(({ field, message }) => {
    const match = ITEM_QUANTITY_FIELD.exec(field ?? '');
    return match && message ? [{ index: Number(match[1]), code: message }] : [];
  });
}
