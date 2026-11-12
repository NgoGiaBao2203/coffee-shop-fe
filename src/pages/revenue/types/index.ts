export type RevenueSortBy =
  'invoiceId' | 'shopName' | 'staffName' | 'createdAt' | 'totalAmount' | 'tableNumber';

export interface RevenueDrink {
  invoiceDetailId: string;
  drinkDetailId: string;
  drinkId: string;
  drinkName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  note: string | null;
}

// One paid invoice with its drinks
export interface RevenueInvoice {
  invoiceId: string;
  invoiceCode: string;
  shopId: string;
  shopName: string;
  staffName: string | null;
  tableNumber: number | null;
  totalAmount: number;
  createdAt: string;
  items: RevenueDrink[];
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
  // Whole filtered period (every page), computed by the BE
  totalRevenue: number;
  items: RevenueInvoice[];
  pagination: PaginationInfo;
}
