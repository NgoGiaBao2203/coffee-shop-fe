import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  CreateDrinkDetailRequest,
  CreateDrinkDetailResponse,
  DeleteDrinkDetailRequest,
  DeleteDrinkDetailResponse,
  EditDrinkDetailRequest,
  EditDrinkDetailResponse,
} from '../types';

export async function createDrinkDetailApi(
  payload: CreateDrinkDetailRequest,
): Promise<CreateDrinkDetailResponse> {
  const response = await api.post<CreateDrinkDetailResponse>(
    ENDPOINT.CREATE_DRINK_DETAIL,
    payload,
    {
      suppressCodes: [
        RESPONSE_CODE.NOT_FOUND,
        RESPONSE_CODE.INVALID_REQUEST,
        RESPONSE_CODE.CONFLICT,
      ],
    },
  );

  return response.data;
}

export async function editDrinkDetailApi(
  payload: EditDrinkDetailRequest,
): Promise<EditDrinkDetailResponse> {
  const response = await api.put<EditDrinkDetailResponse>(ENDPOINT.EDIT_DRINK_DETAIL, payload, {
    suppressCodes: [RESPONSE_CODE.NOT_FOUND, RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT],
  });

  return response.data;
}

export async function deleteDrinkDetailApi(
  payload: DeleteDrinkDetailRequest,
): Promise<DeleteDrinkDetailResponse> {
  const response = await api.delete<DeleteDrinkDetailResponse>(ENDPOINT.DELETE_DRINK_DETAIL, {
    data: payload,
    suppressCodes: [RESPONSE_CODE.NOT_FOUND, RESPONSE_CODE.INVALID_REQUEST],
  });

  return response.data;
}
