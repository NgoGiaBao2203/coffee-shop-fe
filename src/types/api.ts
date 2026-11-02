// Common response shapes shared by every backend API

export type SortDirection = 'ASC' | 'DESC';

export interface ApiResponse {
  code: string;
  message: string;
  traceId: string;
}

// Field validation: { field, message: 'EVxxx' }; duplicate on category/table edit: { errorCode: 'ER005', message }
export interface ApiErrorDetail {
  field?: string;
  errorCode?: string;
  message: string;
}

export interface ApiErrorResponse extends Partial<ApiResponse> {
  errorDetails?: ApiErrorDetail[] | null;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> extends ApiResponse {
  items: T[];
  pagination: PaginationInfo;
}
