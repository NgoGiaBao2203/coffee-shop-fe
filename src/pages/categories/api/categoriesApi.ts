import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  CategoryListParams,
  CategoryListResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  EditCategoryRequest,
  EditCategoryResponse,
  DeleteCategoryRequest,
  DeleteCategoryResponse,
  ShopNameListResponse,
} from '../types';

export async function getCategoriesApi(params: CategoryListParams): Promise<CategoryListResponse> {
  const response = await api.post<CategoryListResponse>(ENDPOINT.GET_CATEGORIES, params);
  return response.data;
}

export async function getShopNamesApi(): Promise<ShopNameListResponse> {
  const response = await api.get<ShopNameListResponse>(ENDPOINT.GET_SHOP_NAMES);
  return response.data;
}

export async function createCategoryApi(
  params: CreateCategoryRequest,
): Promise<CreateCategoryResponse> {
  const response = await api.post<CreateCategoryResponse>(ENDPOINT.CREATE_CATEGORY, params, {
    suppressCodes: [RESPONSE_CODE.NOT_FOUND, RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT],
  });
  return response.data;
}

export async function editCategoryApi(params: EditCategoryRequest): Promise<EditCategoryResponse> {
  const response = await api.put<EditCategoryResponse>(ENDPOINT.EDIT_CATEGORY, params, {
    suppressCodes: [RESPONSE_CODE.NOT_FOUND, RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT],
  });
  return response.data;
}

export async function deleteCategoryApi(
  params: DeleteCategoryRequest,
): Promise<DeleteCategoryResponse> {
  const response = await api.delete<DeleteCategoryResponse>(ENDPOINT.DELETE_CATEGORY, {
    data: params,
    suppressCodes: [RESPONSE_CODE.NOT_FOUND],
  });
  return response.data;
}
