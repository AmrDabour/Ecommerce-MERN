export interface ApiResponse<T> {
  msg: string;
  data: T;
}

export interface PaginatedProductResponse {
  msg: string;
  page: number;
  results: number;
  data: import('./product.model').Product[];
}
