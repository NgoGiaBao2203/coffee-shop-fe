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
  const response = await api.post<ShopBranchesResponse>(ENDPOINT.GET_SHOP_BRANCHES, payload);
  return response.data;
}

export async function createShopBranchApi(payload: CreateShopBranchRequest): Promise<void> {
  await api.post(ENDPOINT.CREATE_SHOP_BRANCH, payload, {
    suppressCodes: [RESPONSE_CODE.CONFLICT, RESPONSE_CODE.INVALID_REQUEST],
  });
}

export async function editShopBranchApi(payload: EditShopBranchRequest): Promise<void> {
  await api.post(ENDPOINT.EDIT_SHOP_BRANCH, payload, {
    suppressCodes: [RESPONSE_CODE.CONFLICT, RESPONSE_CODE.INVALID_REQUEST],
  });
}

export async function deleteShopBranchApi(payload: DeleteShopBranchRequest): Promise<void> {
  await api.delete(ENDPOINT.DELETE_SHOP_BRANCH, { data: payload });
}
