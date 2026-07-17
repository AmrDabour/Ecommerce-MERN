import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { Product } from '../../core/models/product.model';
import { RecentlyViewedService } from '../../core/services/recently-viewed';

import { FadeInDirective } from '../../shared/directives/fade-in.directive';

import { HeroSliderComponent } from './ui/hero-slider/hero-slider.component';
import { PromoBannersComponent } from './ui/promo-banners/promo-banners.component';
import { TestimonialsComponent } from './ui/testimonials/testimonials.component';
import { ProductCardSkeleton } from '../../shared/components/product-card-skeleton/product-card-skeleton';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { FlashSaleComponent } from './ui/flash-sale/flash-sale';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink, 
    FadeInDirective,
    HeroSliderComponent,
    PromoBannersComponent,
    TestimonialsComponent,
    ProductCardSkeleton,
    ProductCard,
    FlashSaleComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  // Parallax signals
  protected heroMouseX = signal(0);
  protected heroMouseY = signal(0);
  
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  protected readonly authService = inject(AuthService);
  protected readonly wishlistService = inject(WishlistService);
  private readonly toast = inject(ToastService);
  private readonly recService = inject(RecommendationService);
  protected readonly recentlyViewedService = inject(RecentlyViewedService);

  protected readonly featuredProducts = signal<Product[]>([]);
  protected readonly loadingProducts = signal(true);
  protected readonly addingId = signal<string | null>(null);

  protected readonly recommendedProducts = signal<Product[]>([]);
  protected readonly loadingRecommendations = signal(true);

  ngOnInit(): void {
    this.productService.getProducts({ limit: 8, sort: '-ratingsAvg' }).subscribe({
      next: (res) => {
        this.featuredProducts.set(res.data);
        this.loadingProducts.set(false);
      },
      error: () => this.loadingProducts.set(false),
    });

    if (this.authService.isAuthenticated()) {
      this.recService.getUserRecommendations(12).subscribe({
        next: (res) => {
          this.recommendedProducts.set(res.products as any); // Cast to any to handle Product vs returned type differences if any, though we mapped it in backend
          this.loadingRecommendations.set(false);
        },
        error: () => this.loadingRecommendations.set(false)
      });
    } else {
      this.loadingRecommendations.set(false);
    }
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

  // addToCart is now handled by ProductCard internally

  // toggleWishlist is now handled by ProductCard internally
}
