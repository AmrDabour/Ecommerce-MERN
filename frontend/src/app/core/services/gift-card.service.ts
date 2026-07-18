import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GiftCard {
  _id: string;
  code: string;
  amount: number;
  status: 'active' | 'used' | 'expired';
  expiryDate: string;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface RedeemResponse {
  msg: string;
  addedAmount: number;
  newBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class GiftCardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/gift-cards`;

  createGiftCard(amount: number, expiryDate: string): Observable<{ msg: string; data: GiftCard }> {
    return this.http.post<{ msg: string; data: GiftCard }>(this.apiUrl, { amount, expiryDate });
  }

  getAllGiftCards(): Observable<{ results: number; data: GiftCard[] }> {
    return this.http.get<{ results: number; data: GiftCard[] }>(this.apiUrl);
  }

  redeemGiftCard(code: string): Observable<RedeemResponse> {
    return this.http.post<RedeemResponse>(`${this.apiUrl}/redeem`, { code });
  }
}
