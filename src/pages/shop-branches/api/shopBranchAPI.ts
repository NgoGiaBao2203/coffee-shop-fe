import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type { SearchShopBranchRequest, ShopBranchesResponse } from '../types';

export async function getShopBranchesApi(
  payload: SearchShopBranchRequest,
): Promise<ShopBranchesResponse> {
  const response = await api.post<ShopBranchesResponse>(ENDPOINT.GET_SHOP_BRANCHES, payload);
  return response.data;
}
