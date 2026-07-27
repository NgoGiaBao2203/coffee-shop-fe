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
  page?: number;
  size?: number;
  keyword?: string;
}
