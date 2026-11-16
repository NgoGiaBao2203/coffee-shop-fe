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

// Field errors and duplicate name / address (ER008 on create, 409 ER005 on edit) are shown on the form
const FORM_SUPPRESS_CODES = [RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT];

export async function getShopsApi(payload: SearchShopRequest): Promise<ShopsResponse> {
  const response = await api.get<ShopsResponse>(ENDPOINT.GET_SHOPS, { params: payload });
  return response.data;
}

export async function createShopApi(payload: CreateShopRequest): Promise<void> {
  await api.post(ENDPOINT.CREATE_SHOP, payload, { suppressCodes: FORM_SUPPRESS_CODES });
}

export async function editShopApi(shopId: string, payload: EditShopRequest): Promise<void> {
  await api.put(`${ENDPOINT.EDIT_SHOP}/${shopId}`, payload, {
    suppressCodes: FORM_SUPPRESS_CODES,
  });
}

export async function deleteShopApi(payload: DeleteShopRequest): Promise<void> {
  await api.delete(ENDPOINT.DELETE_SHOP, { data: payload });
}
