import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type {
  InvoiceListParams,
  InvoiceListResponse,
  CreateInvoiceRequest,
  EditInvoiceRequest,
  PayInvoiceRequest,
  CancelInvoiceRequest,
  InvoiceActionResponse,
  ShopNameListResponse,
} from '../types';

export async function getInvoicesApi(payload: InvoiceListParams): Promise<InvoiceListResponse> {
  const response = await api.post<InvoiceListResponse>(ENDPOINT.GET_INVOICES, payload);
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

export async function getShopNamesApi(): Promise<ShopNameListResponse> {
  const response = await api.get<ShopNameListResponse>(ENDPOINT.GET_SHOP_NAMES);
  return response.data;
}
