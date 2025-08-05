/**
 * Shared utility types for DORA plugin
 */

/**
 * Generic result wrapper for operations that may fail
 */
export interface Result<T, E = string> {
  success: boolean;
  data?: T;
  error?: E;
}

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  field: string;
  value: string | number | boolean;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith';
}

/**
 * Query parameters for API calls
 */
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams[];
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
} 