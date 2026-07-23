export interface StaffItem {
  profileId: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  roleName: string;
  shopName: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface StaffListParams {
  page: number;
  size: number;
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

export interface StaffListResponse {
  code: string;
  message: string;
  traceId: string;
  items: StaffItem[];
  pagination: PaginationInfo;
}

export interface EditStaffRequest {
  profileId: string;
  fullName: string;
  phoneNumber: string;
  roleId: string;
  shopId: string;
}

export interface EditStaffResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface DeleteStaffRequest {
  profileId: string;
}

export interface DeleteStaffResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface CreateStaffRequest {
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  roleId: string;
  shopId?: string;
}

export interface CreateStaffResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface RoleItem {
  roleId: string;
  roleDisplayName: string;
}

export interface RoleListResponse {
  code: string;
  message: string;
  traceId: string;
  roleResult: RoleItem[];
}

export interface ShopNameItem {
  shopId: string;
  shopName: string;
}

export interface ShopNameListResponse {
  code: string;
  message: string;
  traceId: string;
  shopNameResults: ShopNameItem[];
}
