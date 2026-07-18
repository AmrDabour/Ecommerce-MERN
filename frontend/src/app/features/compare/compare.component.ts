import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompareService } from '../../core/services/compare.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Product } from '../../core/models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareComponent {
  protected readonly compareService = inject(CompareService);
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected get compareItems() {
    return this.compareService.compareItems();
  }

  protected getImageUrl(imageCover?: string): string {
    return imageCover || '/assets/images/placeholder.jpg';
  }

  protected removeFromCompare(productId: string): void {
    this.compareService.removeFromCompare(productId);
  }

  protected addToCart(product: Product): void {
    if (this.auth.isAuthenticated()) {
      this.cartService.addToCart(product._id).subscribe({
        next: () => this.toast.success('Added to cart!'),
        error: () => this.toast.error('Could not add to cart.'),
      });
    } else {
      this.cartService.addToGuestCart(product._id);
      this.toast.success('Added to cart!');
    }
  }

  protected clearCompare(): void {
    this.compareService.clearCompare();
  }
}
