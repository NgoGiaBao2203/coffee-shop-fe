import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  SearchTablesRequest,
  TablesListResponse,
  CreateTableRequest,
  EditTableRequest,
  DeleteTableRequest,
  TableMutationResponse,
} from '../types';

export async function getTablesApi(payload: SearchTablesRequest): Promise<TablesListResponse> {
  const response = await api.post<TablesListResponse>(ENDPOINT.GET_TABLES, payload);
  return response.data;
}

// Field errors and duplicate table numbers are shown on the form
const FORM_SUPPRESS_CODES = [RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT];

export async function createTableApi(payload: CreateTableRequest): Promise<void> {
  await api.post(ENDPOINT.CREATE_TABLE, payload, { suppressCodes: FORM_SUPPRESS_CODES });
}

export async function editTableApi(payload: EditTableRequest): Promise<TableMutationResponse> {
  const response = await api.put<TableMutationResponse>(ENDPOINT.EDIT_TABLE, payload, {
    suppressCodes: FORM_SUPPRESS_CODES,
  });
  return response.data;
}

export async function deleteTableApi(payload: DeleteTableRequest): Promise<TableMutationResponse> {
  const response = await api.delete<TableMutationResponse>(ENDPOINT.DELETE_TABLE, {
    data: payload,
  });
  return response.data;
}
