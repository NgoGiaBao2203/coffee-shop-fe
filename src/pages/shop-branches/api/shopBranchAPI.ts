import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  SearchShopBranchRequest,
  ShopBranchesResponse,
  CreateShopBranchRequest,
  EditShopBranchRequest,
  DeleteShopBranchRequest,
} from '../types';

export async function getShopBranchesApi(
  payload: SearchShopBranchRequest,
): Promise<ShopBranchesResponse> {
  const response = await api.get<ShopBranchesResponse>(ENDPOINT.GET_SHOPES, {
    params: payload,
  });
  return response.data;
}

export async function createShopBranchApi(payload: CreateShopBranchRequest): Promise<void> {
  await api.post(ENDPOINT.CREATE_SHOP, payload, {
    suppressCodes: [RESPONSE_CODE.CONFLICT, RESPONSE_CODE.INVALID_REQUEST],
  });
}

export async function editShopBranchApi(
  shopId: string,
  payload: EditShopBranchRequest,
): Promise<void> {
  await api.put(`${ENDPOINT.EDIT_SHOP}/${shopId}`, payload, {
    suppressCodes: [RESPONSE_CODE.CONFLICT, RESPONSE_CODE.INVALID_REQUEST],
  });
}

export async function deleteShopBranchApi(payload: DeleteShopBranchRequest): Promise<void> {
  await api.delete(ENDPOINT.DELETE_SHOP, { data: payload });
}
