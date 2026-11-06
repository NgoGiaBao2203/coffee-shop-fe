export type RevenueSortBy =
  | 'invoiceId'
  | 'shopName'
  | 'fullName'
  | 'drinkName'
  | 'createdAt'
  | 'totalAmount'
  | 'tableNumber'
  | 'size'
  | 'quantity'
  | 'price';

// One row per drink line of a paid invoice
export interface RevenueResult {
  invoiceId: string;
  invoiceCode: string;
  shopId: string;
  shopName: string;
  fullName: string;
  drinkName: string;
  createdAt: string;
  totalAmount: number;
  tableNumber: number | null;
  size: string;
  quantity: number;
  price: number;
  note: string | null;
}

export interface GetRevenuesRequest {
  page: number;
  size: number;
  search?: string;
  shopId?: string;
  invoiceId?: string;
  // yyyy-MM-dd
  startDate?: string;
  endDate?: string;
  sortBy?: RevenueSortBy;
  sortDirection?: 'ASC' | 'DESC';
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GetRevenuesResponse {
  code: string;
  message: string;
  traceId: string;
  totalRevenue: number;
  totalInvoices: number;
  items: RevenueResult[];
  pagination: PaginationInfo;
}
