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
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
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
