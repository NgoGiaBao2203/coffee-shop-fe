import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type {
  InvoiceListParams,
  InvoiceListResponse,
  CreateInvoiceRequest,
  EditInvoiceRequest,
  UpdateInvoiceStatusRequest,
  InvoiceActionResponse,
  ShopNameListResponse,
} from '../types';

export async function getInvoicesApi(payload: InvoiceListParams): Promise<InvoiceListResponse> {
  const response = await api.post<InvoiceListResponse>(ENDPOINT.GET_INVOICES, {
    ...payload,
    shopId: payload.shopId || undefined,
    status: payload.status ? Number(payload.status) : undefined,
  });
  return response.data;
}

export async function createInvoiceApi(
  payload: CreateInvoiceRequest,
): Promise<InvoiceActionResponse> {
  const response = await api.post<InvoiceActionResponse>(ENDPOINT.CREATE_INVOICE, payload);
  return response.data;
}

export async function editInvoiceApi(payload: EditInvoiceRequest): Promise<InvoiceActionResponse> {
  const response = await api.put<InvoiceActionResponse>(ENDPOINT.EDIT_INVOICE, payload);
  return response.data;
}

export async function updateInvoiceStatusApi(
  payload: UpdateInvoiceStatusRequest,
): Promise<InvoiceActionResponse> {
  const response = await api.put<InvoiceActionResponse>(ENDPOINT.UPDATE_INVOICE_STATUS, payload);
  return response.data;
}

export async function getShopNamesApi(): Promise<ShopNameListResponse> {
  const response = await api.get<ShopNameListResponse>(ENDPOINT.GET_SHOP_NAMES);
  return response.data;
}
