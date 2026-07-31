export interface CategoryItem {
  drinkCategoryId: string;
  categoryName: string;
  isDeleted?: boolean;
  shopId?: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface DrinkItem {
  drinkCategoryId: string;
  drinkId: string;
  drinkName: string;
  imageUrl?: string | null;
  isDeleted: boolean;
  price: string;
  size: string;
  status: string;
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

export interface GetDrinksRequest {
  page: number;
  size: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface CreateDrinkRequest {
  drinkName: string;
  imageUrl?: string;
  status: number;
  isDeleted: boolean;
  price: number;
  size: string;
  shopId: string;
  drinkCategoryId: string;
  drinkDetailId?: string;
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

export interface EditDrinkRequest {
  drinkId: string;
  drinkName: string;
  imageUrl?: string;
  status: number;
  drinkCategoryId: string;
  price: number;
  size: string;
}

export interface EditDrinkResponse {
  code: string;
  message: string;
  traceId: string;
}
