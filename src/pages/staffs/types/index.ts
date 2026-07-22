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
