import type { ApiResponse, PageResponse, SortDirection } from '@/types/api';

// Kept for features that still import the dropdown types from here (revenue)
export type { ShopNameItem } from '@/types/dropdown';

// The list has no roleId / shopId and `isDeleted` is always null, so neither is typed here
export interface StaffItem {
  profileId: string;
  fullName: string | null;
  username: string;
  email: string;
  phoneNumber: string | null;
  // QUẢN LÝ / NHÂN VIÊN
  roleName: string;
  shopName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface StaffListParams {
  page: number;
  size: number;
  // UUIDs from the dropdowns; empty = no filter (never send a non-UUID, the backend returns 500)
  roleId: string;
  branchShopId: string;
  search: string;
  sortBy:
    | 'profileId'
    | 'email'
    | 'username'
    | 'fullName'
    | 'phoneNumber'
    | 'shopName'
    | 'roleName'
    | 'createdAt'
    | 'updatedAt'
    | 'isDeleted';
  sortDirection: SortDirection;
}

export type StaffListResponse = PageResponse<StaffItem>;

export interface CreateStaffRequest {
  email: string;
  username: string;
  fullName?: string;
  phoneNumber?: string;
  roleId: string;
  shopId: string;
}

// email / username cannot be edited; MANAGER cannot change roleId / shopId (ignored by the backend)
export interface EditStaffRequest {
  profileId: string;
  fullName: string;
  phoneNumber?: string;
  roleId: string;
  shopId: string;
}

export interface DeleteStaffRequest {
  profileId: string;
}

export type StaffMutationResponse = ApiResponse;
