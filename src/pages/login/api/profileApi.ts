import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type { GetProfileResponse, LoginRequest } from '../types';

export async function getProfileApi(payload: LoginRequest): Promise<GetProfileResponse> {
  const response = await api.post<GetProfileResponse>(ENDPOINT.GET_PROFILE, payload, {
    suppressCodes: [RESPONSE_CODE.NOT_FOUND, RESPONSE_CODE.EMAIL_OR_PASSWORD_INCORRECT],
  });
  return response.data;
}
