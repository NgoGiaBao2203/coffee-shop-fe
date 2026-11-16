import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type { CreateOrderRequest, CreateOrderResponse } from '../types';

// ER008 is shown by the order editor (quantity errors on the cart lines, otherwise a toast)
const ORDER_SUPPRESS_CODES = [RESPONSE_CODE.INVALID_REQUEST];

export async function createOrderApi(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  const response = await api.post<CreateOrderResponse>(ENDPOINT.CREATE_INVOICE, payload, {
    suppressCodes: ORDER_SUPPRESS_CODES,
  });
  return response.data;
}
