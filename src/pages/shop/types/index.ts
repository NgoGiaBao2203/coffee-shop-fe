import type { PageResponse, SortDirection } from '@/types/api';

export interface ShopItem {
  shopId: string;
  shopName: string;
  address: string;
  phoneNumber: string;
  activeStaffCount: number;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: boolean;
}

// GET /shops takes query params (the only list API not using a JSON body)
export interface SearchShopRequest {
  page: number;
  size: number;
  search?: string;
  sortBy?:
    'shopId' | 'shopName' | 'address' | 'phoneNumber' | 'createdAt' | 'updatedAt' | 'isDeleted';
  // Must be upper case in the query string
  sortDirection?: SortDirection;
}

export type ShopsResponse = PageResponse<ShopItem>;

export interface CreateShopRequest {
  shopName: string;
  address: string;
  phoneNumber: string;
}

export type EditShopRequest = CreateShopRequest;

export interface DeleteShopRequest {
  shopId: string;
}
