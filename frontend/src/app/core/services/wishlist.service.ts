import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';

export interface WishlistResponse {
  status: string;
  results?: number;
  data: Product[];
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly auth = inject(AuthService);

  readonly wishlist = signal<Product[]>([]);
  readonly wishlistCount = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    // If user is logged in, load wishlist
    if (this.auth.isAuthenticated()) {
      this.getWishlist().subscribe();
    }
  }

  getWishlist(): Observable<WishlistResponse> {
    this.isLoading.set(true);
    return this.http.get<WishlistResponse>(`${this.apiUrl}/wishlist`).pipe(
      tap(res => {
        this.wishlist.set(res.data);
        this.wishlistCount.set(res.data.length);
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/wishlist`, { productId }).pipe(
      tap(res => {
        // Ideally the API would return the populated products, but it just returns IDs
        // So we will just re-fetch the wishlist to get full product objects
        this.getWishlist().subscribe();
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/wishlist/${productId}`).pipe(
      tap(res => {
        // Remove from local signal directly to avoid full refetch
        this.wishlist.update(items => items.filter(p => p._id !== productId));
        this.wishlistCount.set(this.wishlist().length);
      })
    );
  }

  isInWishlist(productId: string): boolean {
    return this.wishlist().some(p => p._id === productId);
  }
}
