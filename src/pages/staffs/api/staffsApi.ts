import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type { StaffListParams, StaffListResponse } from '../types';

export async function getStaffsApi(params: StaffListParams): Promise<StaffListResponse> {
  const response = await api.post<StaffListResponse>(ENDPOINT.GET_STAFFS, params);
  return response.data;
}
