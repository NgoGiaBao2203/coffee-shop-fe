import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type {
  CategoryItem,
  DrinksResponse,
  GetDrinksRequest,
  CreateDrinkRequest,
  CreateDrinkResponse,
  DeleteDrinkRequest,
  DeleteDrinkResponse,
  EditDrinkRequest,
  EditDrinkResponse,
} from '../types';

// Fetch all drink categories
export async function getCategoriesApi(): Promise<CategoryItem[]> {
  const response = await api.get<CategoryItem[]>(ENDPOINT.GET_CATEGORIES);
  return response.data;
}

// Fetch paginated drinks list
export async function getDrinksApi(payload: GetDrinksRequest): Promise<DrinksResponse> {
  const response = await api.post<DrinksResponse>(ENDPOINT.GET_DRINKS, payload);
  return response.data;
}

// Create a new drink
export async function createDrinkApi(payload: CreateDrinkRequest): Promise<CreateDrinkResponse> {
  const response = await api.post<CreateDrinkResponse>(ENDPOINT.CREATE_DRINK, payload);
  return response.data;
}

// Edit an existing drink
export async function editDrinkApi(payload: EditDrinkRequest): Promise<EditDrinkResponse> {
  const response = await api.put<EditDrinkResponse>(ENDPOINT.EDIT_DRINK, payload);
  return response.data;
}

// Delete a drink (Soft Delete)
export async function deleteDrinkApi(payload: DeleteDrinkRequest): Promise<DeleteDrinkResponse> {
  const response = await api.delete<DeleteDrinkResponse>(ENDPOINT.DELETE_DRINK, { data: payload });
  return response.data;
}
