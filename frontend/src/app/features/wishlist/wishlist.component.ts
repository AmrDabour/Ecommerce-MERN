import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistComponent {
  readonly wishlistService = inject(WishlistService);
  readonly cartService = inject(CartService);
  readonly toast = inject(ToastService);
  readonly addingId = signal<string | null>(null);

  protected getStars(avg?: number): string {
    const n = Math.round(avg ?? 0);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  protected getDiscountPct(p: Product): number {
    if (!p.priceAfterDiscount) return 0;
    return Math.round((1 - p.priceAfterDiscount / p.price) * 100);
  }

  protected addToCart(product: Product): void {
    this.addingId.set(product._id);
    this.cartService.addToCart(product._id).subscribe({
      next: () => {
        this.addingId.set(null);
        this.toast.success('Added to cart!');
        // Optionally remove from wishlist after adding to cart
        this.wishlistService.removeFromWishlist(product._id).subscribe();
      },
      error: () => {
        this.addingId.set(null);
        this.toast.error('Could not add to cart.');
      },
    });
  }

  protected removeFromWishlist(product: Product): void {
    this.wishlistService.removeFromWishlist(product._id).subscribe({
      next: () => this.toast.success('Removed from wishlist'),
      error: () => this.toast.error('Could not remove from wishlist')
    });
  }
}
