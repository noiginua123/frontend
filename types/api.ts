// types/api.ts
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Cấu trúc thông tin message lỗi từ Backend API
 */
export interface BackendErrorMessage {
  code?: string;
  params?: (string | number)[];
}

/**
 * Cấu trúc body trả về khi Backend API xảy ra lỗi
 */
export interface BackendErrorBody {
  code?: string | number;
  message?: BackendErrorMessage;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

