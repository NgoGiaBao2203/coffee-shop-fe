import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  StaffListParams,
  StaffListResponse,
  EditStaffRequest,
  DeleteStaffRequest,
  CreateStaffRequest,
  StaffMutationResponse,
} from '../types';

// Kept for features that still import it from here (revenue)
export { getShopNamesApi } from '@/api/dropdownApi';

// Field errors and duplicates (ER005: username / email / phone) are shown on the form
const FORM_SUPPRESS_CODES = [RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT];

export async function getStaffsApi(params: StaffListParams): Promise<StaffListResponse> {
  const response = await api.post<StaffListResponse>(ENDPOINT.GET_STAFFS, {
    ...params,
    roleId: params.roleId || undefined,
    branchShopId: params.branchShopId || undefined,
  });
  return response.data;
}

export async function createStaffApi(params: CreateStaffRequest): Promise<StaffMutationResponse> {
  const response = await api.post<StaffMutationResponse>(ENDPOINT.CREATE_STAFF, params, {
    suppressCodes: FORM_SUPPRESS_CODES,
  });
  return response.data;
}

export async function editStaffApi(params: EditStaffRequest): Promise<StaffMutationResponse> {
  const response = await api.put<StaffMutationResponse>(ENDPOINT.EDIT_STAFF, params, {
    suppressCodes: FORM_SUPPRESS_CODES,
  });
  return response.data;
}

export async function deleteStaffApi(params: DeleteStaffRequest): Promise<StaffMutationResponse> {
  const response = await api.delete<StaffMutationResponse>(ENDPOINT.DELETE_STAFF, {
    data: params,
  });
  return response.data;
}
