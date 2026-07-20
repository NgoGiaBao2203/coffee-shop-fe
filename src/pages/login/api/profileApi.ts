import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type { GetProfileResponse, LoginRequest } from '../types';

export async function getProfileApi(payload: LoginRequest): Promise<GetProfileResponse> {
  const response = await api.post<GetProfileResponse>(ENDPOINT.GET_PROFILE, payload);
  return response.data;
}
