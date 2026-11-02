import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  InvoiceListParams,
  InvoiceListResponse,
  CreateInvoiceRequest,
  EditInvoiceRequest,
  UpdateInvoiceStatusRequest,
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

export async function createInvoiceApi(
  payload: CreateInvoiceRequest,
): Promise<InvoiceActionResponse> {
  const response = await api.post<InvoiceActionResponse>(ENDPOINT.CREATE_INVOICE, payload, {
    suppressCodes: ORDER_SUPPRESS_CODES,
  });
  return response.data;
}

export async function editInvoiceApi(payload: EditInvoiceRequest): Promise<InvoiceActionResponse> {
  const response = await api.put<InvoiceActionResponse>(ENDPOINT.EDIT_INVOICE, payload, {
    suppressCodes: ORDER_SUPPRESS_CODES,
  });
  return response.data;
}

export async function updateInvoiceStatusApi(
  payload: UpdateInvoiceStatusRequest,
): Promise<InvoiceActionResponse> {
  const response = await api.put<InvoiceActionResponse>(ENDPOINT.UPDATE_INVOICE_STATUS, payload);
  return response.data;
}
