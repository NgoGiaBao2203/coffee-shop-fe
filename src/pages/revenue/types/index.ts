export interface RevenueResult {
  invoiceId: string;
  shopId: string;
  shopName: string;
  fullName: string;
  drinkName: string;
  createdAt: string;
  totalAmount: number;
  tableNumber: number;
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
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  sortBy?: string;
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
  items: RevenueResult[];
  pagination: PaginationInfo;
}
