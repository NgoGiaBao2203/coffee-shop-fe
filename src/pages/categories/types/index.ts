export interface CategoryItem {
  categoryId: string;
  categoryName: string;
  shopId: string;
}

export interface CategoryListParams {
  page: number;
  size: number;
  branchShopId: string;
  search: string;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CategoryListResponse {
  code: string;
  message: string;
  traceId: string;
  items: CategoryItem[];
  pagination: PaginationInfo;
}

export interface CreateCategoryRequest {
  categoryName: string;
  shopId: string;
}

export interface CreateCategoryResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface EditCategoryRequest {
  categoryId: string;
  categoryName: string;
}

export interface EditCategoryResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface DeleteCategoryRequest {
  categoryId: string;
}

export interface DeleteCategoryResponse {
  code: string;
  message: string;
  traceId: string;
}
