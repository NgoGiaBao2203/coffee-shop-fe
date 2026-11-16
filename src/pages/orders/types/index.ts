import type { ApiResponse } from '@/types/api';
import type { OrderPayload } from '@/types/order';

// The backend always creates a PENDING invoice, so no status is sent
export type CreateOrderRequest = OrderPayload;

export interface CreateOrderResponse extends ApiResponse {
  invoiceId: string;
}
