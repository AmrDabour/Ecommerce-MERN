import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductQueryParams, CreateProductRequest } from '../models/product.model';
import { ApiResponse, PaginatedProductResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getProducts(params?: ProductQueryParams): Observable<PaginatedProductResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<PaginatedProductResponse>(`${this.apiUrl}/products`, {
      params: httpParams,
    });
  }

  uploadImage(file: File): Observable<{ message: string, url: string, filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ message: string, url: string, filename: string }>(`${this.apiUrl}/api/upload`, formData);
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(data: CreateProductRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/products`, data);
  }

  updateProduct(id: string, data: Partial<CreateProductRequest>): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/products/${id}`);
  }
}
