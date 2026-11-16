import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  DrinksResponse,
  GetDrinkDetailResponse,
  GetDrinksRequest,
  CreateDrinkRequest,
  CreateDrinkResponse,
  DeleteDrinkRequest,
  DeleteDrinkResponse,
  EditDrinkRequest,
  EditDrinkResponse,
} from '../types';

// Field errors and duplicates (size on create, name on edit) are shown on the form
const FORM_SUPPRESS_CODES = [RESPONSE_CODE.INVALID_REQUEST, RESPONSE_CODE.CONFLICT];

// The `api` instance defaults to JSON, which makes axios turn a FormData into JSON (and drop the
// image, then the backend answers 415). Overriding it keeps the FormData; the browser adds the
// multipart boundary itself.
const MULTIPART_HEADERS = { 'Content-Type': 'multipart/form-data' };

// multipart body: part `data` (JSON) + optional part `image` (.jpg / .png, max 5MB)
function toDrinkFormData(payload: CreateDrinkRequest | EditDrinkRequest, imageFile?: File) {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return formData;
}

export async function getDrinksApi(payload: GetDrinksRequest): Promise<DrinksResponse> {
  const response = await api.post<DrinksResponse>(ENDPOINT.GET_DRINKS, {
    ...payload,
    shopId: payload.shopId || undefined,
  });
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
  const response = await api.post<CreateDrinkResponse>(
    ENDPOINT.CREATE_DRINK,
    toDrinkFormData(payload, imageFile),
    { headers: MULTIPART_HEADERS, suppressCodes: FORM_SUPPRESS_CODES },
  );
  return response.data;
}

export async function deleteDrinkApi(payload: DeleteDrinkRequest): Promise<DeleteDrinkResponse> {
  const response = await api.delete<DeleteDrinkResponse>(ENDPOINT.DELETE_DRINK, {
    data: payload,
  });
  return response.data;
}

export async function editDrinkApi(
  payload: EditDrinkRequest,
  imageFile?: File,
): Promise<EditDrinkResponse> {
  const response = await api.put<EditDrinkResponse>(
    ENDPOINT.EDIT_DRINK,
    toDrinkFormData(payload, imageFile),
    { headers: MULTIPART_HEADERS, suppressCodes: FORM_SUPPRESS_CODES },
  );
  return response.data;
}
