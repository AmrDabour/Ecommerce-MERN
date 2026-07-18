import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UpdateUserRequest } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`);
  }

  updateUser(id: string, data: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/users/${id}`);
  }

  convertPointsToWallet(pointsToConvert: number): Observable<{msg: string, walletBalance: number, points: number}> {
    return this.http.post<{msg: string, walletBalance: number, points: number}>(`${this.apiUrl}/users/wallet/convert-points`, { pointsToConvert });
  }

  addWalletBalance(userId: string, amount: number): Observable<{msg: string, walletBalance: number}> {
    return this.http.post<{msg: string, walletBalance: number}>(`${this.apiUrl}/users/wallet/add`, { userId, amount });
  }
}
