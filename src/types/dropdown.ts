import type { ApiResponse } from './api';

export interface ShopNameItem {
  shopId: string;
  shopName: string;
}

export interface RoleItem {
  roleId: string;
  roleDisplayName: string;
}

export interface CategoryDropdownItem {
  categoryId: string;
  categoryName: string;
  shopId: string;
  shopName: string;
}

export interface ShopNameListResponse extends ApiResponse {
  shopNameResults: ShopNameItem[];
}

export interface RoleListResponse extends ApiResponse {
  roleResult: RoleItem[];
}

export interface CategoryDropdownResponse extends ApiResponse {
  categoryResult: CategoryDropdownItem[];
}
