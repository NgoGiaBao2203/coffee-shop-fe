import type { DrinkSize } from '../constants';

export interface DrinkVariantItem {
  drinkDetailId: string;
  size: string;
  price: number | string;
}

export interface DrinkItem {
  drinkCategoryId: string;
  categoryName?: string;
  drinkId: string;
  shopId: string;
  drinkName: string;
  imageUrl?: string | null;
  isDeleted: boolean;
  status: string;
  variants: DrinkVariantItem[] | null;
}

export interface DrinksPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DrinksResponse {
  code: string;
  message: string;
  traceId: string;
  items: DrinkItem[];
  pagination: DrinksPagination;
}

export interface GetDrinkDetailResponse {
  code: string;
  message: string;
  traceId: string;
  item: DrinkItem;
}

export interface GetDrinksRequest {
  page: number;
  size: number;
  shopId: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface CreateDrinkRequest {
  drinkName: string;
  imageUrl: string;
  status: number;
  price: number;
  size: string;
  shopId: string;
  drinkCategoryId: string;
}

export interface CreateDrinkResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface DeleteDrinkRequest {
  drinkId: string;
}

export interface DeleteDrinkResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface CategoryDropdownItem {
  categoryId: string;
  categoryName: string;
  shopId: string;
  shopName: string;
}

export interface CategoryDropdownResponse {
  code: string;
  message: string;
  traceId: string;
  categoryResult: CategoryDropdownItem[];
}

export interface CategorySelectOption {
  value: string;
  label: string;
  shopId: string;
}

export interface EditDrinkRequest {
  drinkId: string;
  drinkName: string;
  imageUrl?: string;
  status: number;
  drinkCategoryId: string;
}

export interface EditDrinkResponse {
  code: string;
  message: string;
  traceId: string;
}

// Drink Detail

export interface CreateDrinkDetailRequest {
  drinkId: string;
  size: DrinkSize;
  price: number;
}

export interface CreateDrinkDetailResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface EditDrinkDetailRequest {
  drinkDetailId: string;
  size: DrinkSize;
  price: number;
}

export interface EditDrinkDetailResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface DeleteDrinkDetailRequest {
  drinkDetailId: string;
}

export interface DeleteDrinkDetailResponse {
  code: string;
  message: string;
  traceId: string;
}
