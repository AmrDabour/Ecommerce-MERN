import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-content container" style="padding-top: calc(var(--header-height) + var(--space-8));">
      <h1 class="checkout-title">Checkout</h1>

      <div class="checkout-layout">
        <!-- Form -->
        <div class="checkout-form-section">
          <form [formGroup]="form" (ngSubmit)="placeOrder()">
            <!-- Shipping Address -->
            <div class="checkout-card">
              <h2 class="checkout-card__title">📦 Shipping Address</h2>

              <div class="form-group">
                <label class="form-label" for="street">Street address</label>
                <input id="street" type="text" class="form-input"
                  [class.form-input--error]="f['street'].invalid && f['street'].touched"
                  formControlName="street" placeholder="123 Main St" />
                @if (f['street'].invalid && f['street'].touched) {
                  <span class="form-error">Street address is required.</span>
                }
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="city">City</label>
                  <input id="city" type="text" class="form-input"
                    [class.form-input--error]="f['city'].invalid && f['city'].touched"
                    formControlName="city" placeholder="Cairo" />
                  @if (f['city'].invalid && f['city'].touched) {
                    <span class="form-error">City is required.</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label" for="zip">ZIP code</label>
                  <input id="zip" type="text" class="form-input"
                    formControlName="zip" placeholder="12345" />
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="checkout-card">
              <h2 class="checkout-card__title">💳 Payment Method</h2>

              <div class="payment-options">
                <label class="payment-option" [class.payment-option--selected]="f['paymentMethod'].value === 'cash'">
                  <input type="radio" formControlName="paymentMethod" value="cash" />
                  <div class="payment-option__content">
                    <span class="payment-option__icon">💵</span>
                    <div>
                      <div class="payment-option__title">Cash on Delivery</div>
                      <div class="payment-option__desc">Pay when your order arrives</div>
                    </div>
                  </div>
                </label>

                <label class="payment-option" [class.payment-option--selected]="f['paymentMethod'].value === 'card'">
                  <input type="radio" formControlName="paymentMethod" value="card" />
                  <div class="payment-option__content">
                    <span class="payment-option__icon">💳</span>
                    <div>
                      <div class="payment-option__title">Credit / Debit Card</div>
                      <div class="payment-option__desc">Secure card payment (coming soon)</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" class="checkout-submit" [disabled]="loading() || form.invalid">
              @if (loading()) { <span class="checkout-spinner"></span> }
              {{ loading() ? 'Placing Order…' : 'Place Order' }}
            </button>
          </form>
        </div>

        <!-- Order Summary -->
        <div class="checkout-summary">
          <h2 class="checkout-card__title" style="margin-bottom: var(--space-5);">🛒 Order Summary</h2>

          @if (cartService.cart()) {
            <div class="checkout-items">
              @for (item of cartService.cart()!.cartItems; track item._id) {
                <div class="checkout-item">
                  <div class="checkout-item__info">
                    <span class="checkout-item__qty">×{{ item.quantity }}</span>
                    <span class="checkout-item__name">{{ getItemName(item) }}</span>
                  </div>
                  <span class="checkout-item__price">\${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
              }
            </div>

            <div class="checkout-totals">
              <div class="checkout-total-row">
                <span>Subtotal</span>
                <span>\${{ getSubtotal().toFixed(2) }}</span>
              </div>
              @if (cartService.cart()!.totalPriceAfterDiscount != null &&
                   cartService.cart()!.totalPriceAfterDiscount! < getSubtotal()) {
                <div class="checkout-total-row checkout-total-row--discount">
                  <span>Discount</span>
                  <span>-\${{ (getSubtotal() - cartService.cart()!.totalPriceAfterDiscount!).toFixed(2) }}</span>
                </div>
              }
              <div class="checkout-total-row checkout-total-row--total">
                <strong>Total</strong>
                <strong>\${{ (cartService.cart()!.totalPriceAfterDiscount ?? getSubtotal()).toFixed(2) }}</strong>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-title {
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      margin-bottom: var(--space-8);
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--space-8);
      align-items: start;
    }

    .checkout-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      margin-bottom: var(--space-4);
    }

    .checkout-card__title {
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      margin-bottom: var(--space-5);
    }

    .form-group { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-4); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); }

    .form-input {
      padding: var(--space-3) var(--space-4);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-family: inherit;
      background: var(--color-surface);
      color: var(--color-text);
      outline: none;
      &:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(4,120,87,0.12); }
    }

    .form-input--error { border-color: var(--color-error) !important; }
    .form-error { font-size: var(--text-xs); color: var(--color-error); }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    /* Payment */
    .payment-options { display: flex; flex-direction: column; gap: var(--space-3); }

    .payment-option {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      input[type="radio"] { display: none; }

      &:hover { border-color: var(--color-accent-light); }
    }

    .payment-option--selected {
      border-color: var(--color-accent) !important;
      background: var(--color-accent-lighter);
    }

    .payment-option__content {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .payment-option__icon { font-size: 1.5rem; }
    .payment-option__title { font-size: var(--text-sm); font-weight: var(--weight-semibold); }
    .payment-option__desc { font-size: var(--text-xs); color: var(--color-text-tertiary); margin-top: 2px; }

    .checkout-submit {
      width: 100%;
      padding: var(--space-4);
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      min-height: 52px;
      &:hover:not(:disabled) { background: var(--color-accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }

    .checkout-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    /* Summary */
    .checkout-summary {
      position: sticky;
      top: calc(var(--header-height) + var(--space-4));
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
    }

    .checkout-items {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .checkout-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
    }

    .checkout-item__info { display: flex; align-items: center; gap: var(--space-2); }
    .checkout-item__qty {
      background: var(--color-surface-alt);
      border-radius: var(--radius-sm);
      padding: 2px 8px;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      color: var(--color-text-secondary);
      white-space: nowrap;
    }

    .checkout-item__name {
      font-size: var(--text-sm);
      color: var(--color-text);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .checkout-item__price { font-size: var(--text-sm); font-weight: var(--weight-semibold); white-space: nowrap; }

    .checkout-totals {
      border-top: 1px solid var(--color-border);
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .checkout-total-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }

    .checkout-total-row--discount { color: var(--color-success); }

    .checkout-total-row--total {
      font-size: var(--text-base);
      color: var(--color-text);
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-3);
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1024px) {
      .checkout-layout { grid-template-columns: 1fr; }
      .checkout-summary { position: static; }
    }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `],
})
export class CheckoutComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    zip: [''],
    paymentMethod: ['cash' as 'cash' | 'card', Validators.required],
  });

  protected get f() { return this.form.controls; }

  ngOnInit(): void {
    // Pre-fill from user profile if available
    const user = this.auth.currentUser();
    if (user?.address) {
      this.form.patchValue({
        street: user.address.street,
        city: user.address.city,
        zip: user.address.zip,
      });
    }

    // Fetch cart
    this.cartService.fetchCart().subscribe();
  }

  protected getSubtotal(): number {
    return this.cartService.cart()?.cartItems.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  }

  protected getItemName(item: { product: unknown }): string {
    if (!item.product) return 'Product';
    if (typeof item.product === 'object' && item.product !== null) {
      return (item.product as { name: string }).name ?? 'Product';
    }
    return 'Product';
  }

  protected placeOrder(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const { street, city, zip, paymentMethod } = this.form.value;
    this.orderService.createOrder({
      paymentMethod: paymentMethod as 'cash' | 'card',
      shippingAddress: { street: street!, city: city!, zip: zip ?? '' },
    }).subscribe({
      next: (res) => {
        this.cartService.clearCartSignal();
        this.toast.success('Order placed successfully!');
        this.router.navigate(['/orders', res.data._id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.error?.msg ?? 'Could not place order. Please try again.');
      },
    });
  }
}
