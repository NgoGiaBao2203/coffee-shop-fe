export interface ShopBranchItem {
  shopId: string;
  shopName: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ShopBranchPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SearchShopBranchRequest {
  shopId?: string;
  page: number;
  size: number;
  search?: string;
  sortBy?:
    'shopId' | 'shopName' | 'address' | 'phoneNumber' | 'createdAt' | 'updatedAt' | 'isDeleted';
  sortDirection?: 'ASC' | 'DESC';
}

export interface ShopBranchesResponse {
  code: string;
  message: string;
  traceId: string;
  items: ShopBranchItem[];
  pagination: ShopBranchPagination;
}

export interface CreateShopBranchRequest {
  shopName: string;
  address: string;
  phoneNumber: string;
}

export interface EditShopBranchRequest {
  shopId: string;
  shopName: string;
  address: string;
  phoneNumber: string;
  isDeleted?: boolean;
}

export interface DeleteShopBranchRequest {
  shopId: string;
}
