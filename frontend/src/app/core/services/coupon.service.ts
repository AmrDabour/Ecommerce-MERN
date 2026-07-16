import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coupon, CreateCouponRequest } from '../models/coupon.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getCoupons(): Observable<ApiResponse<Coupon[]>> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.apiUrl}/coupons`);
  }

  createCoupon(data: CreateCouponRequest): Observable<ApiResponse<Coupon>> {
    return this.http.post<ApiResponse<Coupon>>(`${this.apiUrl}/coupons`, data);
  }

  updateCoupon(id: string, data: Partial<CreateCouponRequest>): Observable<ApiResponse<Coupon>> {
    return this.http.patch<ApiResponse<Coupon>>(`${this.apiUrl}/coupons/${id}`, data);
  }

  deleteCoupon(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/coupons/${id}`);
  }
}
