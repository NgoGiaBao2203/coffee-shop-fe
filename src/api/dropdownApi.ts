import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type {
  CategoryDropdownResponse,
  RoleListResponse,
  ShopNameListResponse,
} from '@/types/dropdown';

// Dropdown APIs are OWNER / MANAGER only (STAFF gets 403 ER003)

export async function getShopNamesApi(): Promise<ShopNameListResponse> {
  const response = await api.get<ShopNameListResponse>(ENDPOINT.GET_DROPDOWN_SHOP_NAMES);
  return response.data;
}

export async function getRolesApi(): Promise<RoleListResponse> {
  const response = await api.get<RoleListResponse>(ENDPOINT.GET_DROPDOWN_ROLES);
  return response.data;
}

export async function getDropdownCategoriesApi(): Promise<CategoryDropdownResponse> {
  const response = await api.get<CategoryDropdownResponse>(ENDPOINT.GET_DROPDOWN_CATEGORIES);
  return response.data;
}
