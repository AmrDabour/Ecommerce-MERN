import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-content container" style="padding-top: calc(var(--header-height) + var(--space-8));">
      <h1 class="cart-title">Shopping Cart</h1>

      @if (loading()) {
        <div class="cart-loading">
          @for (i of [1,2,3]; track i) {
            <div class="cart-item-skeleton"></div>
          }
        </div>
      } @else if ((cartService.cart()?.cartItems ?? []).length === 0 && !auth.isAuthenticated()) {
        <!-- Guest or empty -->
        <div class="cart-empty">
          <div class="cart-empty__icon">🛒</div>
          <h2 class="cart-empty__title">Your cart is empty</h2>
          <p class="cart-empty__desc">Looks like you haven't added anything to your cart yet</p>
          <a routerLink="/products" class="cart-empty__btn">Continue Shopping</a>
        </div>
      } @else if ((cartService.cart()?.cartItems ?? []).length === 0) {
        <div class="cart-empty">
          <div class="cart-empty__icon">🛒</div>
          <h2 class="cart-empty__title">Your cart is empty</h2>
          <p class="cart-empty__desc">Looks like you haven't added anything to your cart yet</p>
          <a routerLink="/products" class="cart-empty__btn">Continue Shopping</a>
        </div>
      } @else {
        <div class="cart-layout">
          <!-- Items -->
          <div class="cart-items">
            @for (item of cartService.cart()!.cartItems; track item._id) {
              <div class="cart-item">
                <div class="cart-item__img">
                  @if (getProduct(item)?.imageCover) {
                    <img [src]="getProduct(item)!.imageCover" [alt]="getProduct(item)!.name" />
                  } @else {
                    <div class="cart-item__img-placeholder">📦</div>
                  }
                </div>
                <div class="cart-item__info">
                  <a [routerLink]="['/products', getProductId(item)]" class="cart-item__name">
                    {{ getProduct(item)?.name ?? 'Product' }}
                  </a>
                  <div class="cart-item__unit-price">\${{ item.price.toFixed(2) }} each</div>
                </div>
                <div class="cart-item__qty">
                  <button class="qty-btn" (click)="updateQty(item, item.quantity - 1)"
                    [disabled]="updatingId() === item._id">−</button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button class="qty-btn" (click)="updateQty(item, item.quantity + 1)"
                    [disabled]="updatingId() === item._id">+</button>
                </div>
                <div class="cart-item__total">\${{ (item.price * item.quantity).toFixed(2) }}</div>
                <button class="cart-item__remove" (click)="removeItem(item._id)"
                  [disabled]="removingId() === item._id"
                  aria-label="Remove item">
                  @if (removingId() === item._id) { … } @else { ✕ }
                </button>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div class="cart-summary">
            <h2 class="cart-summary__title">Order Summary</h2>

            <!-- Coupon -->
            <div class="cart-coupon">
              <input type="text" class="cart-coupon__input" placeholder="Coupon code"
                [(ngModel)]="couponCodeValue" [disabled]="applyingCoupon()" />
              <button class="cart-coupon__btn" (click)="applyCoupon()"
                [disabled]="!couponCodeValue || applyingCoupon()">
                {{ applyingCoupon() ? '…' : 'Apply' }}
              </button>
            </div>
            @if (couponError()) {
              <div class="cart-coupon__error">{{ couponError() }}</div>
            }

            <div class="cart-summary__rows">
              <div class="cart-summary__row">
                <span>Subtotal</span>
                <span>\${{ getSubtotal().toFixed(2) }}</span>
              </div>
              @if (cartService.cart()!.totalPriceAfterDiscount != null &&
                   cartService.cart()!.totalPriceAfterDiscount! < getSubtotal()) {
                <div class="cart-summary__row cart-summary__row--discount">
                  <span>Coupon discount</span>
                  <span>-\${{ (getSubtotal() - cartService.cart()!.totalPriceAfterDiscount!).toFixed(2) }}</span>
                </div>
              }
              <div class="cart-summary__row cart-summary__row--total">
                <span>Total</span>
                <strong>\${{ (cartService.cart()!.totalPriceAfterDiscount ?? getSubtotal()).toFixed(2) }}</strong>
              </div>
            </div>

            @if (auth.isAuthenticated()) {
              <a routerLink="/checkout" class="cart-checkout-btn">Proceed to Checkout →</a>
            } @else {
              <a routerLink="/login" [queryParams]="{ returnUrl: '/checkout' }" class="cart-checkout-btn">
                Sign in to Checkout →
              </a>
            }

            <a routerLink="/products" class="cart-continue-link">← Continue Shopping</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-title {
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      margin-bottom: var(--space-8);
    }

    /* Layout */
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: var(--space-8);
      align-items: start;
    }

    /* Items */
    .cart-items { display: flex; flex-direction: column; gap: var(--space-4); }

    .cart-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      transition: box-shadow var(--transition-fast);
      &:hover { box-shadow: var(--shadow-sm); }
    }

    .cart-item__img {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface-alt);
      flex-shrink: 0;
      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .cart-item__img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .cart-item__info { flex: 1; }
    .cart-item__name {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text);
      text-decoration: none;
      margin-bottom: var(--space-1);
      &:hover { color: var(--color-accent); }
    }

    .cart-item__unit-price { font-size: var(--text-xs); color: var(--color-text-tertiary); }

    /* Qty stepper */
    .cart-item__qty {
      display: flex;
      align-items: center;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface-alt);
      border: none;
      cursor: pointer;
      font-size: var(--text-lg);
      transition: background var(--transition-fast);
      font-family: inherit;
      &:hover:not(:disabled) { background: var(--color-border); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .qty-value {
      width: 40px;
      text-align: center;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
    }

    .cart-item__total {
      min-width: 70px;
      text-align: right;
      font-weight: var(--weight-bold);
      font-size: var(--text-sm);
    }

    .cart-item__remove {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
      background: none;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: var(--text-sm);
      transition: all var(--transition-fast);
      font-family: inherit;
      &:hover:not(:disabled) { color: var(--color-error); border-color: var(--color-error); background: var(--color-error-light); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    /* Summary */
    .cart-summary {
      position: sticky;
      top: calc(var(--header-height) + var(--space-4));
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
    }

    .cart-summary__title {
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      margin-bottom: var(--space-5);
    }

    /* Coupon */
    .cart-coupon {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .cart-coupon__input {
      flex: 1;
      padding: var(--space-2) var(--space-3);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      font-family: inherit;
      background: var(--color-surface);
      outline: none;
      &:focus { border-color: var(--color-accent); }
    }

    .cart-coupon__btn {
      padding: var(--space-2) var(--space-4);
      background: var(--color-accent-lighter);
      color: var(--color-accent);
      border: 1.5px solid var(--color-accent);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      cursor: pointer;
      font-family: inherit;
      white-space: nowrap;
      transition: all var(--transition-fast);
      &:hover:not(:disabled) { background: var(--color-accent); color: white; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .cart-coupon__error {
      font-size: var(--text-xs);
      color: var(--color-error);
      margin-bottom: var(--space-3);
    }

    .cart-summary__rows {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .cart-summary__row {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }

    .cart-summary__row--discount { color: var(--color-success); }

    .cart-summary__row--total {
      font-size: var(--text-base);
      color: var(--color-text);
      font-weight: var(--weight-semibold);
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-3);
      margin-top: var(--space-1);
    }

    .cart-checkout-btn {
      display: block;
      width: 100%;
      padding: var(--space-4);
      background: var(--color-accent);
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: var(--radius-md);
      font-weight: var(--weight-semibold);
      font-size: var(--text-sm);
      transition: all var(--transition-fast);
      &:hover { background: var(--color-accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
    }

    .cart-continue-link {
      display: block;
      text-align: center;
      margin-top: var(--space-4);
      font-size: var(--text-sm);
      color: var(--color-text-tertiary);
      text-decoration: none;
      &:hover { color: var(--color-accent); }
    }

    /* Empty */
    .cart-empty {
      text-align: center;
      padding: var(--space-20) var(--space-8);
    }

    .cart-empty__icon { font-size: 4rem; margin-bottom: var(--space-4); }
    .cart-empty__title { font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-2); }
    .cart-empty__desc { color: var(--color-text-tertiary); margin-bottom: var(--space-8); }
    .cart-empty__btn {
      display: inline-block;
      padding: var(--space-3) var(--space-8);
      background: var(--color-accent);
      color: white;
      text-decoration: none;
      border-radius: var(--radius-md);
      font-weight: var(--weight-semibold);
      font-size: var(--text-sm);
      &:hover { background: var(--color-accent-hover); }
    }

    /* Loading skeleton */
    .cart-loading { display: flex; flex-direction: column; gap: var(--space-4); }
    .cart-item-skeleton {
      height: 100px;
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-lg);
    }

    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 1024px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-summary { position: static; }
    }

    @media (max-width: 600px) {
      .cart-item { flex-wrap: wrap; }
      .cart-item__img { width: 60px; height: 60px; }
    }
  `],
})
export class CartComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly updatingId = signal<string | null>(null);
  protected readonly removingId = signal<string | null>(null);
  protected readonly applyingCoupon = signal(false);
  protected readonly couponError = signal('');
  protected couponCodeValue = '';

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.cartService.fetchCart().subscribe({
        next: () => this.loading.set(false),
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  protected getSubtotal(): number {
    return this.cartService.cart()?.cartItems.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  }

  protected getProduct(item: CartItem) {
    return typeof item.product === 'object' ? item.product as { _id: string; name: string; imageCover?: string } : null;
  }

  protected getProductId(item: CartItem): string {
    return typeof item.product === 'string' ? item.product : (item.product as { _id: string })._id;
  }

  protected updateQty(item: CartItem, newQty: number): void {
    if (newQty < 1) return;
    this.updatingId.set(item._id);
    this.cartService.updateQuantity(item._id, newQty).subscribe({
      next: () => this.updatingId.set(null),
      error: () => { this.updatingId.set(null); this.toast.error('Could not update quantity.'); },
    });
  }

  protected removeItem(itemId: string): void {
    this.removingId.set(itemId);
    this.cartService.removeItem(itemId).subscribe({
      next: () => { this.removingId.set(null); this.toast.success('Item removed.'); },
      error: () => { this.removingId.set(null); this.toast.error('Could not remove item.'); },
    });
  }

  protected applyCoupon(): void {
    if (!this.couponCodeValue) return;
    this.applyingCoupon.set(true);
    this.couponError.set('');
    this.cartService.applyCoupon(this.couponCodeValue).subscribe({
      next: () => {
        this.applyingCoupon.set(false);
        this.toast.success('Coupon applied!');
      },
      error: (err) => {
        this.applyingCoupon.set(false);
        this.couponError.set(err?.error?.msg ?? 'Invalid coupon code.');
      },
    });
  }
}
