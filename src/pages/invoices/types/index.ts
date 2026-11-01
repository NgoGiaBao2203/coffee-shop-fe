export interface InvoiceItemResult {
  invoiceDetailId: string;
  drinkDetailId: string;
  drinkId?: string;
  drinkName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  note?: string | null;
}

export interface InvoiceItem {
  invoiceId: string;
  invoiceCode?: string;
  shopId: string;
  tableId?: string;
  shopName: string;
  staffName: string | null;
  tableNumber: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updateAt: string;
  isDeleted: boolean;
  items?: InvoiceItemResult[];
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface InvoiceListParams {
  page: number;
  size: number;
  search: string;
  shopId?: string;
  status?: string;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
}

export interface InvoiceListResponse {
  code?: string;
  message: string;
  traceId?: string;
  items: InvoiceItem[];
  pagination: PaginationInfo;
}

export interface CreateInvoiceRequest {
  shopId: string;
  tableId: string;
  // 0 = pay later, 1 = paid at the counter
  status: 0 | 1;
  items: CreateInvoiceDetailItem[];
}

export interface CreateInvoiceDetailItem {
  drinkDetailId: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

export interface EditInvoiceRequest {
  invoiceId: string;
  tableNumber: number;
  items: {
    drinkDetailId: string;
    quantity: number;
    note?: string;
  }[];
}

export interface UpdateInvoiceStatusRequest {
  invoiceId: string;
  status: 1 | 2;
}

export interface InvoiceActionResponse {
  code: string;
  message: string;
  traceId: string;
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
