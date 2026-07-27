import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type { DrinksResponse, GetDrinksRequest } from '../types';

export async function getDrinksApi(payload: GetDrinksRequest): Promise<DrinksResponse> {
  const response = await api.post<DrinksResponse>(ENDPOINT.GET_DRINKS, payload);
  return response.data;
}
