import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, CreateReviewRequest, UpdateReviewRequest } from '../models/review.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getReviews(productId?: string): Observable<ApiResponse<Review[]>> {
    const url = productId
      ? `${this.apiUrl}/reviews?product=${productId}`
      : `${this.apiUrl}/reviews`;
    return this.http.get<ApiResponse<Review[]>>(url);
  }

  getReview(id: string): Observable<ApiResponse<Review>> {
    return this.http.get<ApiResponse<Review>>(`${this.apiUrl}/reviews/${id}`);
  }

  createReview(data: CreateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.apiUrl}/reviews`, data);
  }

  updateReview(id: string, data: UpdateReviewRequest): Observable<ApiResponse<Review>> {
    return this.http.patch<ApiResponse<Review>>(`${this.apiUrl}/reviews/${id}`, data);
  }

  deleteReview(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/reviews/${id}`);
  }
}
