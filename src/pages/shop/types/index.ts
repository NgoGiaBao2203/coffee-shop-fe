export interface ShopItem {
  shopId: string;
  shopName: string;
  address: string;
  phoneNumber: string | null;
  activeStaffCount: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ShopPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SearchShopRequest {
  shopId?: string;
  page: number;
  size: number;
  search?: string;
  sortBy?:
    'shopId' | 'shopName' | 'address' | 'phoneNumber' | 'createdAt' | 'updatedAt' | 'isDeleted';
  sortDirection?: 'ASC' | 'DESC';
}

export interface ShopsResponse {
  code: string;
  message: string;
  traceId: string;
  items: ShopItem[];
  pagination: ShopPagination;
}

export interface CreateShopRequest {
  shopName: string;
  address: string;
  phoneNumber: string;
}

export interface EditShopRequest {
  shopName: string;
  address: string;
  phoneNumber: string;
}

export interface DeleteShopRequest {
  shopId: string;
}
