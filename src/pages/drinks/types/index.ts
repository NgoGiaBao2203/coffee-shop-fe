import type { ApiResponse, PageResponse, SortDirection } from '@/types/api';
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
  // "Đang bán" / "Ngừng bán" / "Không xác định"
  status: string;
  // Always null in POST /drinks, filled by GET /drink/detail/{drinkId}
  variants: DrinkVariantItem[] | null;
}

export type DrinksResponse = PageResponse<DrinkItem>;

export interface GetDrinkDetailResponse extends ApiResponse {
  item: DrinkItem;
}

export interface GetDrinksRequest {
  page: number;
  size: number;
  // Only applied for OWNER; empty = every shop
  shopId: string;
  search?: string;
  sortBy?: 'drinkId' | 'shopId' | 'drinkCategoryId' | 'drinkName' | 'status' | 'isDeleted';
  sortDirection?: SortDirection;
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

export type CreateDrinkResponse = ApiResponse;

export interface DeleteDrinkRequest {
  drinkId: string;
}

export type DeleteDrinkResponse = ApiResponse;

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

export type EditDrinkResponse = ApiResponse;

// Drink Detail

export interface DrinkDetailFormValues {
  size: DrinkSize;
  price: string;
}

export interface DrinkDetailSubmitValues {
  size: DrinkSize;
  price: number;
}

export interface CreateDrinkDetailRequest {
  drinkId: string;
  size: DrinkSize;
  price: number;
}

export type CreateDrinkDetailResponse = ApiResponse;

export interface EditDrinkDetailRequest {
  drinkDetailId: string;
  size: DrinkSize;
  price: number;
}

export type EditDrinkDetailResponse = ApiResponse;

export interface DeleteDrinkDetailRequest {
  drinkDetailId: string;
}

export type DeleteDrinkDetailResponse = ApiResponse;

// Order (cash payment)
