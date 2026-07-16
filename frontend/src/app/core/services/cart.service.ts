import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, GuestCartItem } from '../models/cart.model';
import { ApiResponse } from '../models/api-response.model';

const GUEST_CART_KEY = 'ecommerce_guest_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _cart = signal<Cart | null>(null);
  private readonly _guestCart = signal<GuestCartItem[]>(this.loadGuestCart());

  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(() => {
    const cart = this._cart();
    if (cart) return cart.cartItems.reduce((sum, i) => sum + i.quantity, 0);
    return this._guestCart().reduce((sum, i) => sum + i.quantity, 0);
  });
  readonly subtotal = computed(() => this._cart()?.totalPrice ?? 0);

  private loadGuestCart(): GuestCartItem[] {
    try {
      return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private saveGuestCart(items: GuestCartItem[]): void {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    this._guestCart.set(items);
  }

  fetchCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(`${this.apiUrl}/cart`).pipe(
      tap((res) => this._cart.set(res.data)),
    );
  }

  addToCart(productId: string): Observable<ApiResponse<Cart>> {
    return this.http
      .post<ApiResponse<Cart>>(`${this.apiUrl}/cart`, { product: productId })
      .pipe(tap((res) => this._cart.set(res.data)));
  }

  addToGuestCart(productId: string): void {
    const current = this._guestCart();
    const idx = current.findIndex((i) => i.productId === productId);
    let updated: GuestCartItem[];
    if (idx > -1) {
      updated = current.map((item, i) =>
        i === idx ? { ...item, quantity: item.quantity + 1 } : item,
      );
    } else {
      updated = [...current, { productId, quantity: 1 }];
    }
    this.saveGuestCart(updated);
  }

  updateQuantity(itemId: string, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http
      .patch<ApiResponse<Cart>>(`${this.apiUrl}/cart/${itemId}`, { quantity })
      .pipe(tap((res) => this._cart.set(res.data)));
  }

  removeItem(itemId: string): Observable<ApiResponse<Cart>> {
    return this.http
      .delete<ApiResponse<Cart>>(`${this.apiUrl}/cart/${itemId}`)
      .pipe(tap((res) => this._cart.set(res.data)));
  }

  clearCart(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/cart/clear`).pipe(
      tap(() => this._cart.set(null)),
    );
  }

  clearCartSignal(): void {
    this._cart.set(null);
  }

  applyCoupon(code: string): Observable<ApiResponse<Cart>> {
    return this.http
      .post<ApiResponse<Cart>>(`${this.apiUrl}/coupons/apply`, { code })
      .pipe(tap((res) => this._cart.set(res.data)));
  }

  /** Merge guest cart into authenticated backend cart on login */
  async mergeGuestCart(): Promise<void> {
    const guests = this._guestCart();
    if (guests.length === 0) return;
    for (const item of guests) {
      try {
        await this.addToCart(item.productId).toPromise();
      } catch {
        // Continue merging even if one item fails
      }
    }
    localStorage.removeItem(GUEST_CART_KEY);
    this._guestCart.set([]);
  }
}
