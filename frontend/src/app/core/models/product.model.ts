import { Category } from './category.model';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  imageCover?: string;
  images?: string[];
  category: string | Category;
  ratingsAvg?: number;
  ratingsCount?: number;
  sold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  'price[gte]'?: number;
  'price[lte]'?: number;
  sort?: string;
  page?: number;
  limit?: number;
  category?: string;
  keyword?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  imageCover?: string;
  images?: string[];
  category: string;
}
