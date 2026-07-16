import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecommendationResponse {
  products: { product_id: string; score: number }[];
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) {}

  getSimilarProducts(productId: string, topK: number = 8): Observable<RecommendationResponse> {
    return this.http.get<RecommendationResponse>(`${this.apiUrl}/similar/${productId}?top_k=${topK}`);
  }

  getUserRecommendations(topK: number = 12): Observable<RecommendationResponse> {
    return this.http.get<RecommendationResponse>(`${this.apiUrl}/user?top_k=${topK}`);
  }
}
