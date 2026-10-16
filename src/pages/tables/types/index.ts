export interface TableItem {
  tableId: string;
  shopId: string;
  shopName?: string;
  tableNumber: number;
  description: string | null;
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

export interface TablePagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SearchTablesRequest {
  page: number;
  size: number;
  status?: number;
  search?: string;
  sortBy?: 'tableId' | 'tableNumber' | 'status' | 'createdAt' | 'updatedAt';
  sortDirection?: 'ASC' | 'DESC';
  /** Branch filter — applied server-side */
  shopId?: string;
}

export interface TablesListResponse {
  code: string;
  message: string;
  traceId: string;
  items: TableItem[];
  pagination: TablePagination;
}

export interface CreateTableRequest {
  tableNumber: number;
  description?: string;
  shopId: string;
  status: number;
}

export interface EditTableRequest {
  tableId: string;
  tableNumber: number;
  description?: string;
  shopId: string;
  status: number;
}

export interface DeleteTableRequest {
  tableId: string;
  shopId: string;
}

export interface TableMutationResponse {
  code: string;
  message: string;
  traceId: string;
}

export interface ShopNameItem {
  shopId: string;
  shopName: string;
}
