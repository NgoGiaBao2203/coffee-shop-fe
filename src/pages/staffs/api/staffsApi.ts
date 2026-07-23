import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  StaffListParams,
  StaffListResponse,
  EditStaffRequest,
  EditStaffResponse,
  DeleteStaffRequest,
  DeleteStaffResponse,
  CreateStaffRequest,
  CreateStaffResponse,
  RoleListResponse,
  ShopNameListResponse,
} from '../types';

export async function getStaffsApi(params: StaffListParams): Promise<StaffListResponse> {
  const response = await api.post<StaffListResponse>(ENDPOINT.GET_STAFFS, params);
  return response.data;
}

export async function editStaffApi(params: EditStaffRequest): Promise<EditStaffResponse> {
  const response = await api.put<EditStaffResponse>(ENDPOINT.EDIT_STAFF, params, {
    suppressCodes: [RESPONSE_CODE.NOT_FOUND, RESPONSE_CODE.CONFLICT],
  });
  return response.data;
}

export async function createStaffApi(params: CreateStaffRequest): Promise<CreateStaffResponse> {
  const response = await api.post<CreateStaffResponse>(ENDPOINT.CREATE_STAFF, params, {
    suppressCodes: [RESPONSE_CODE.CONFLICT, RESPONSE_CODE.NOT_FOUND],
  });
  return response.data;
}

export async function deleteStaffApi(params: DeleteStaffRequest): Promise<DeleteStaffResponse> {
  const response = await api.delete<DeleteStaffResponse>(ENDPOINT.DELETE_STAFF, {
    data: params,
    suppressCodes: [RESPONSE_CODE.NOT_FOUND],
  });
  return response.data;
}

export async function getRolesApi(): Promise<RoleListResponse> {
  const response = await api.get<RoleListResponse>(ENDPOINT.GET_ROLES);
  return response.data;
}

export async function getShopNamesApi(): Promise<ShopNameListResponse> {
  const response = await api.get<ShopNameListResponse>(ENDPOINT.GET_SHOP_NAMES);
  return response.data;
}
