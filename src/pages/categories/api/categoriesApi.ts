import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  CategoryListParams,
  CategoryListResponse,
  CategoryMutationResponse,
  CreateCategoryRequest,
  EditCategoryRequest,
  DeleteCategoryRequest,
} from '../types';

// Field errors and duplicate names are shown on the form
const FORM_SUPPRESS_CODES = [RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT];

export async function getCategoriesApi(params: CategoryListParams): Promise<CategoryListResponse> {
  const response = await api.post<CategoryListResponse>(ENDPOINT.GET_CATEGORIES, {
    ...params,
    shopId: params.shopId || undefined,
  });
  return response.data;
}

export async function createCategoryApi(
  params: CreateCategoryRequest,
): Promise<CategoryMutationResponse> {
  const response = await api.post<CategoryMutationResponse>(ENDPOINT.CREATE_CATEGORY, params, {
    suppressCodes: FORM_SUPPRESS_CODES,
  });
  return response.data;
}

export async function editCategoryApi(
  params: EditCategoryRequest,
): Promise<CategoryMutationResponse> {
  const response = await api.put<CategoryMutationResponse>(ENDPOINT.EDIT_CATEGORY, params, {
    suppressCodes: FORM_SUPPRESS_CODES,
  });
  return response.data;
}

export async function deleteCategoryApi(
  params: DeleteCategoryRequest,
): Promise<CategoryMutationResponse> {
  const response = await api.delete<CategoryMutationResponse>(ENDPOINT.DELETE_CATEGORY, {
    data: params,
  });
  return response.data;
}
