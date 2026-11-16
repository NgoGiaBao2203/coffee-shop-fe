import type { ApiResponse, PageResponse, SortDirection } from '@/types/api';

// Status sent in requests: 0 = pending (unpaid), 1 = completed (paid), 2 = cancelled
export const INVOICE_STATUS = {
  PENDING: 0,
  COMPLETED: 1,
  CANCELLED: 2,
} as const;

// Status returned in responses
export const INVOICE_STATUS_NAME = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

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
  tableNumber: number | null;
  totalAmount: number;
  // PENDING / COMPLETED / CANCELLED
  status: string;
  createdAt: string;
  // The backend names it updateAt (not updatedAt)
  updateAt: string;
  isDeleted: boolean;
  items?: InvoiceItemResult[];
}

export interface InvoiceListParams {
  page: number;
  size: number;
  search: string;
  shopId?: string;
  // '0' / '1' / '2' from the status filter; empty = every status
  status?: string;
  sortBy:
    | 'invoiceId'
    | 'totalAmount'
    | 'status'
    | 'tableNumber'
    | 'createdAt'
    | 'updateAt'
    | 'isDeleted'
    | 'shopName'
    | 'staffName';
  sortDirection: SortDirection;
}

export type InvoiceListResponse = PageResponse<InvoiceItem>;

export interface CreateInvoiceDetailItem {
  drinkDetailId: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

export interface EditInvoiceRequest {
  invoiceId: string;
  shopId: string;
  tableId: string;
  items: CreateInvoiceDetailItem[];
}

export interface PayInvoiceRequest {
  invoiceId: string;
}

export type CancelInvoiceRequest = PayInvoiceRequest;

// Only COMPLETED (paid) invoices can be printed; the response is a PDF file
export type PrintInvoiceRequest = PayInvoiceRequest;

export type InvoiceActionResponse = ApiResponse;
