export * from './tile';

export * from './errors';

// Common types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingState {
  loading: boolean;
  error: Error | null;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}
