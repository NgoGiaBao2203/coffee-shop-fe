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

export async function createTableApi(payload: CreateTableRequest): Promise<void> {
  await api.post(ENDPOINT.CREATE_TABLE, payload, {
    // Field-level errors are surfaced inside the create modal
    suppressCodes: [RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT],
  });
}

export async function editTableApi(payload: EditTableRequest): Promise<TableMutationResponse> {
  const response = await api.put<TableMutationResponse>(ENDPOINT.EDIT_TABLE, payload, {
    // Field-level errors are surfaced inside the edit modal
    suppressCodes: [RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT],
  });
  return response.data;
}

export async function deleteTableApi(payload: DeleteTableRequest): Promise<TableMutationResponse> {
  const response = await api.delete<TableMutationResponse>(ENDPOINT.DELETE_TABLE, {
    data: payload,
    suppressCodes: [RESPONSE_CODE.NOT_FOUND],
  });
  return response.data;
}
