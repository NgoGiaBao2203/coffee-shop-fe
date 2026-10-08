export interface InvoiceItemResult {
  invoiceDetailId: string;
  drinkDetailId: string;
  drinkName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  note?: string;
}

export interface InvoiceItem {
  invoiceId: string;
  shopId: string;
  shopName: string;
  staffName: string;
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
  shopId?: string;
  tableNumber: number;
  items: CreateInvoiceDetailItem[];
}

export interface CreateInvoiceDetailItem {
  drinkDetailId: string;
  drinkName?: string;
  size?: string;
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

export interface PayInvoiceRequest {
  invoiceId: string;
}

export interface CancelInvoiceRequest {
  invoiceId: string;
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
