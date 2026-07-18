import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReferralInfo {
  referralCode: string;
  referralCount: number;
  earnedCoupons: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/referral';

  validateCode(code: string): Observable<{ msg: string, valid: boolean, ownerName?: string }> {
    return this.http.post<{ msg: string, valid: boolean, ownerName?: string }>(`${this.apiUrl}/validate`, { code });
  }

  getMyInfo(): Observable<{ msg: string, data: ReferralInfo }> {
    return this.http.get<{ msg: string, data: ReferralInfo }>(`${this.apiUrl}/my-info`);
  }
}
