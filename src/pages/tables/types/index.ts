import type { ApiResponse, PageResponse, SortDirection } from '@/types/api';

// 1 = available, 2 = occupied (set by invoices), 3 = reserved
export type TableStatus = 1 | 2 | 3;

export const TABLE_STATUS = {
  AVAILABLE: 1,
  OCCUPIED: 2,
  RESERVED: 3,
} as const;

// Null fields are omitted from the JSON; createdAt / updatedAt are never sent to STAFF
export interface TableItem {
  tableId: string;
  shopId: string;
  shopName?: string;
  tableNumber: number;
  description?: string | null;
  status: number;
  statusName?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TableFormValues {
  tableNumber: number;
  description?: string;
  status: number;
  shopId: string;
}

export interface TableShopOption {
  value: string;
  label: string;
}

export interface SearchTablesRequest {
  page: number;
  size: number;
  status?: number;
  search?: string;
  sortBy?: 'tableId' | 'tableNumber' | 'status' | 'shopId' | 'createdAt' | 'updatedAt';
  sortDirection?: SortDirection;
  /** Branch filter — applied server-side */
  shopId?: string;
}

export type TablesListResponse = PageResponse<TableItem>;

export interface CreateTableRequest {
  tableNumber: number;
  description?: string;
  shopId: string;
  status: number;
}

export interface EditTableRequest {
  tableId: string;
  tableNumber: number;
  // Omitted = the description is cleared
  description?: string;
  shopId: string;
  status: number;
}

export interface DeleteTableRequest {
  tableId: string;
  shopId: string;
}

export type TableMutationResponse = ApiResponse;
