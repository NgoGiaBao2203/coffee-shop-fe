import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type { GetRevenuesRequest, GetRevenuesResponse } from '../types';

export async function getRevenuesApi(params: GetRevenuesRequest): Promise<GetRevenuesResponse> {
  // Convert empty string filters to undefined before sending payload
  const payload = {
    ...params,
    search: params.search?.trim() || undefined,
    shopId: params.shopId || undefined,
    invoiceId: params.invoiceId || undefined,
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
  };

  const response = await api.post<GetRevenuesResponse>(ENDPOINT.GET_REVENUES, payload);
  return response.data;
}
