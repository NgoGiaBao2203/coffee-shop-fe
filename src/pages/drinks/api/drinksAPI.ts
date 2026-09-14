import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type {
  DrinksResponse,
  GetDrinkDetailResponse,
  GetDrinksRequest,
  CreateDrinkRequest,
  CreateDrinkResponse,
  DeleteDrinkRequest,
  DeleteDrinkResponse,
  CategoryDropdownResponse,
  EditDrinkRequest,
  EditDrinkResponse,
} from '../types';

export async function getDrinksApi(payload: GetDrinksRequest): Promise<DrinksResponse> {
  const response = await api.post<DrinksResponse>(ENDPOINT.GET_DRINKS, payload);
  return response.data;
}

// Fetch single drink detail including variants (size & price) via GET method
export async function getDrinkDetailApi(drinkId: string): Promise<GetDrinkDetailResponse> {
  const response = await api.get<GetDrinkDetailResponse>(`${ENDPOINT.GET_DRINK_DETAIL}/${drinkId}`);
  return response.data;
}

export async function createDrinkApi(
  payload: CreateDrinkRequest,
  imageFile?: File,
): Promise<CreateDrinkResponse> {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await api.post<CreateDrinkResponse>(ENDPOINT.CREATE_DRINK, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function deleteDrinkApi(payload: DeleteDrinkRequest): Promise<DeleteDrinkResponse> {
  const response = await api.delete<DeleteDrinkResponse>(ENDPOINT.DELETE_DRINK, { data: payload });
  return response.data;
}

export async function getDropdownCategoriesApi(): Promise<CategoryDropdownResponse> {
  const response = await api.get<CategoryDropdownResponse>(ENDPOINT.GET_DROPDOWN_CATEGORIES);
  return response.data;
}

export async function editDrinkApi(
  payload: EditDrinkRequest,
  imageFile?: File,
): Promise<EditDrinkResponse> {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await api.put<EditDrinkResponse>(ENDPOINT.UPDATE_DRINK, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
