import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  SearchTablesRequest,
  TablesListResponse,
  CreateTableRequest,
  EditTableRequest,
  DeleteTableRequest,
  ChangeTableStatusRequest,
  TableMutationResponse,
} from '../types';
import { TABLE_STATUS } from '../types';

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

const TABLE_STATUS_ENDPOINT: Record<number, string> = {
  [TABLE_STATUS.AVAILABLE]: ENDPOINT.RELEASE_TABLE,
  [TABLE_STATUS.OCCUPIED]: ENDPOINT.OCCUPY_TABLE,
  [TABLE_STATUS.RESERVED]: ENDPOINT.RESERVE_TABLE,
};

// The interceptor shows the error message; the caller reloads the table map
export async function changeTableStatusApi(
  status: number,
  payload: ChangeTableStatusRequest,
): Promise<TableMutationResponse> {
  const response = await api.put<TableMutationResponse>(TABLE_STATUS_ENDPOINT[status], payload);
  return response.data;
}

export async function deleteTableApi(payload: DeleteTableRequest): Promise<TableMutationResponse> {
  const response = await api.delete<TableMutationResponse>(ENDPOINT.DELETE_TABLE, {
    data: payload,
  });
  return response.data;
}
