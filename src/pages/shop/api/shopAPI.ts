import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  SearchShopRequest,
  ShopsResponse,
  CreateShopRequest,
  EditShopRequest,
  DeleteShopRequest,
} from '../types';

export async function getShopsApi(payload: SearchShopRequest): Promise<ShopsResponse> {
  const response = await api.get<ShopsResponse>(ENDPOINT.GET_SHOPES, {
    params: payload,
  });
  return response.data;
}

export async function createShopApi(payload: CreateShopRequest): Promise<void> {
  await api.post(ENDPOINT.CREATE_SHOP, payload, {
    suppressCodes: [RESPONSE_CODE.CONFLICT, RESPONSE_CODE.INVALID_REQUEST],
  });
}

export async function editShopApi(shopId: string, payload: EditShopRequest): Promise<void> {
  await api.put(`${ENDPOINT.EDIT_SHOP}/${shopId}`, payload, {
    suppressCodes: [RESPONSE_CODE.CONFLICT, RESPONSE_CODE.INVALID_REQUEST],
  });
}

export async function deleteShopApi(payload: DeleteShopRequest): Promise<void> {
  await api.delete(ENDPOINT.DELETE_SHOP, { data: payload });
}
