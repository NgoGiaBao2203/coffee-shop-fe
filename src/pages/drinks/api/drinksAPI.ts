import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type {
  DrinksResponse,
  GetDrinksRequest,
  CreateDrinkRequest,
  CreateDrinkResponse,
  DeleteDrinkRequest,
  DeleteDrinkResponse,
} from '../types';

export async function getDrinksApi(payload: GetDrinksRequest): Promise<DrinksResponse> {
  const response = await api.post<DrinksResponse>(ENDPOINT.GET_DRINKS, payload);
  return response.data;
}

export async function createDrinkApi(payload: CreateDrinkRequest): Promise<CreateDrinkResponse> {
  const response = await api.post<CreateDrinkResponse>(ENDPOINT.CREATE_DRINK, payload);
  return response.data;
}

export async function deleteDrinkApi(payload: DeleteDrinkRequest): Promise<DeleteDrinkResponse> {
  const response = await api.delete<DeleteDrinkResponse>(ENDPOINT.DELETE_DRINK, { data: payload });
  return response.data;
}
