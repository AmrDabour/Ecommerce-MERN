import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuickViewService } from '../../../core/services/quick-view';
import { ToastService } from '../../ui/toast/toast.service';
import { TiltDirective } from '../../directives/tilt.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, TiltDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  public product = input.required<Product>();
  
  @Output() quickView = new EventEmitter<Product>();

  private readonly cartService = inject(CartService);
  public readonly wishlistService = inject(WishlistService);
  private readonly authService = inject(AuthService);
  private readonly quickViewService = inject(QuickViewService);
  private readonly toast = inject(ToastService);

  public isAdding = signal(false);

  public getStars(): string {
    const avg = this.product().ratingsAvg;
    const n = Math.round(avg ?? 0);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  public getDiscountPct(): number {
    const p = this.product();
    if (!p.priceAfterDiscount) return 0;
    return Math.round((1 - p.priceAfterDiscount / p.price) * 100);
  }

  public addToCart(): void {
    const p = this.product();
    if (this.authService.isAuthenticated()) {
      this.isAdding.set(true);
      this.cartService.addToCart(p._id).subscribe({
        next: () => {
          this.isAdding.set(false);
          this.toast.success(`"${p.name}" added to cart!`);
        },
        error: () => {
          this.isAdding.set(false);
          this.toast.error('Could not add to cart.');
        },
      });
    } else {
      this.cartService.addToGuestCart(p._id);
      this.toast.success('Added to cart!');
    }
  }

  public toggleWishlist(): void {
    const p = this.product();
    if (!this.authService.isAuthenticated()) {
      this.toast.error('Please login to add to wishlist');
      return;
    }
    
    if (this.wishlistService.isInWishlist(p._id)) {
      this.wishlistService.removeFromWishlist(p._id).subscribe({
        next: () => this.toast.success('Removed from wishlist')
      });
    } else {
      this.wishlistService.addToWishlist(p._id).subscribe({
        next: () => this.toast.success('Added to wishlist')
      });
    }
  }

  public onQuickViewClick(): void {
    this.quickView.emit(this.product());
    this.quickViewService.open(this.product());
  }
}
