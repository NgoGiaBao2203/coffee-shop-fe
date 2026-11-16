import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type { GetRevenuesRequest, GetRevenuesResponse } from '../types';

// Convert empty string filters to undefined before sending payload
function toRevenuePayload(params: GetRevenuesRequest) {
  return {
    ...params,
    search: params.search?.trim() || undefined,
    shopId: params.shopId || undefined,
    invoiceId: params.invoiceId || undefined,
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
  };
}

export async function getRevenuesApi(params: GetRevenuesRequest): Promise<GetRevenuesResponse> {
  const response = await api.post<GetRevenuesResponse>(
    ENDPOINT.GET_REVENUES,
    toRevenuePayload(params),
  );
  return response.data;
}

// Same filters as the list (page/size are ignored by the BE); returns the .xlsx file
export async function exportRevenuesApi(params: GetRevenuesRequest): Promise<Blob> {
  const response = await api.post<Blob>(ENDPOINT.EXPORT_REVENUES, toRevenuePayload(params), {
    responseType: 'blob',
  });
  return response.data;
}
