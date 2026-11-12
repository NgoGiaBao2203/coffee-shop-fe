import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  InvoiceListParams,
  InvoiceListResponse,
  EditInvoiceRequest,
  PayInvoiceRequest,
  CancelInvoiceRequest,
  PrintInvoiceRequest,
  InvoiceActionResponse,
} from '../types';

// ER008 is shown by the order editor (quantity errors on the cart lines, otherwise a toast)
const ORDER_SUPPRESS_CODES = [RESPONSE_CODE.INVALID_REQUEST];

export async function getInvoicesApi(payload: InvoiceListParams): Promise<InvoiceListResponse> {
  const response = await api.post<InvoiceListResponse>(ENDPOINT.GET_INVOICES, {
    ...payload,
    shopId: payload.shopId || undefined,
    status:
      payload.status === undefined || payload.status === '' ? undefined : Number(payload.status),
  });
  return response.data;
}

export async function editInvoiceApi(payload: EditInvoiceRequest): Promise<InvoiceActionResponse> {
  const response = await api.put<InvoiceActionResponse>(ENDPOINT.EDIT_INVOICE, payload, {
    suppressCodes: ORDER_SUPPRESS_CODES,
  });
  return response.data;
}

export async function payInvoiceApi(payload: PayInvoiceRequest): Promise<InvoiceActionResponse> {
  const response = await api.put<InvoiceActionResponse>(ENDPOINT.PAY_INVOICE, payload);
  return response.data;
}

export async function cancelInvoiceApi(
  payload: CancelInvoiceRequest,
): Promise<InvoiceActionResponse> {
  const response = await api.put<InvoiceActionResponse>(ENDPOINT.CANCEL_INVOICE, payload);
  return response.data;
}

// 80mm receipt PDF (errors still come back as JSON, parsed by the api interceptor)
export async function printInvoiceApi(payload: PrintInvoiceRequest): Promise<Blob> {
  const response = await api.post<Blob>(ENDPOINT.PRINT_INVOICE, payload, {
    responseType: 'blob',
  });
  return response.data;
}
