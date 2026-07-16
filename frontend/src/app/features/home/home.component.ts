import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';

import { TiltDirective } from '../../shared/directives/tilt.directive';
import { FadeInDirective } from '../../shared/directives/fade-in.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TiltDirective, FadeInDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  // Parallax signals
  protected heroMouseX = signal(0);
  protected heroMouseY = signal(0);
  
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly featuredProducts = signal<Product[]>([]);
  protected readonly loadingCategories = signal(true);
  protected readonly loadingProducts = signal(true);
  protected readonly addingId = signal<string | null>(null);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data.slice(0, 8));
        this.loadingCategories.set(false);
      },
      error: () => this.loadingCategories.set(false),
    });

    this.productService.getProducts({ limit: 8, sort: '-ratingsAvg' }).subscribe({
      next: (res) => {
        this.featuredProducts.set(res.data);
        this.loadingProducts.set(false);
      },
      error: () => this.loadingProducts.set(false),
    });
  }

  onHeroMouseMove(event: MouseEvent) {
    // Calculate values between -1 and 1 based on mouse position relative to window center
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    this.heroMouseX.set(x);
    this.heroMouseY.set(y);
  }

  protected getStars(avg?: number): string {
    const n = Math.round(avg ?? 0);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  protected getDiscountPct(p: Product): number {
    if (!p.priceAfterDiscount) return 0;
    return Math.round((1 - p.priceAfterDiscount / p.price) * 100);
  }

  protected addToCart(product: Product): void {
    if (this.authService.isAuthenticated()) {
      this.addingId.set(product._id);
      this.cartService.addToCart(product._id).subscribe({
        next: () => {
          this.addingId.set(null);
          this.toast.success(`"${product.name}" added to cart!`);
        },
        error: () => {
          this.addingId.set(null);
          this.toast.error('Could not add to cart.');
        },
      });
    } else {
      this.cartService.addToGuestCart(product._id);
      this.toast.success(`"${product.name}" added to cart!`);
    }
  }
}
