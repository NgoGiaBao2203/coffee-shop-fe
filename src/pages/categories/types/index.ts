import type { ApiResponse, PageResponse, SortDirection } from '@/types/api';

export interface CategoryItem {
  categoryId: string;
  categoryName: string;
  shopId: string;
  shopName: string;
}

export interface CategoryListParams {
  page: number;
  size: number;
  // Only applied for OWNER; empty = every shop
  shopId: string;
  search: string;
  sortBy: 'drinkCategoryId' | 'categoryId' | 'shopId' | 'categoryName' | 'isDeleted';
  sortDirection: SortDirection;
}

export type CategoryListResponse = PageResponse<CategoryItem>;

export interface CreateCategoryRequest {
  categoryName: string;
  shopId: string;
}

export interface EditCategoryRequest extends CreateCategoryRequest {
  categoryId: string;
}

export interface DeleteCategoryRequest {
  categoryId: string;
}

export type CategoryMutationResponse = ApiResponse;
