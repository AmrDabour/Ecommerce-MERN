import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  monthlySales: Array<{ month: string, revenue: number, ordersCount: number }>;
  productsByCategory: Array<{ categoryName: string, count: number }>;
  topProducts: Array<{ name: string, price: number, sold: number, quantity: number, imageCover: string }>;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getStats(): Observable<ApiResponse<AdminStats>> {
    return this.http.get<ApiResponse<AdminStats>>(`${this.apiUrl}/admin/stats`);
  }
}
