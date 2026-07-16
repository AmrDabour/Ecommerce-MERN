import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Category } from '../../../core/models/category.model';
import { Product } from '../../../core/models/product.model';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { RatingStarsComponent } from '../../../shared/ui/rating-stars/rating-stars.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [RouterLink, CurrencyFormatPipe, SkeletonComponent, RatingStarsComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="category-page">
      @if (category()) {
        <div class="category-hero container">
          <a routerLink="/products" class="category-back">← All Products</a>
          <h1 class="category-hero__title">{{ category()!.name }}</h1>
          @if (category()!.description) {
            <p class="category-hero__desc">{{ category()!.description }}</p>
          }
        </div>
      }

      <div class="container">
        @if (loading()) {
          <div class="cat-grid">
            @for (i of skeletons; track i) {
              <div style="border:1px solid var(--color-border);border-radius:12px;overflow:hidden;">
                <app-skeleton height="200px" />
                <div style="padding:16px;">
                  <app-skeleton variant="text" width="70%" />
                  <app-skeleton variant="text" width="40%" style="margin-top:8px;" />
                </div>
              </div>
            }
          </div>
        } @else if (products().length === 0) {
          <div class="cat-empty">
            <span>📦</span>
            <p>No products in this category yet.</p>
            <a routerLink="/products">Browse all products</a>
          </div>
        } @else {
          <div class="cat-grid">
            @for (product of products(); track product._id) {
              <div class="product-card" [routerLink]="['/products', product._id]">
                <div class="product-card__img-wrap">
                  @if (product.imageCover) {
                    <img [src]="product.imageCover" [alt]="product.name" loading="lazy" />
                  } @else {
                    <div class="product-card__no-img">📷</div>
                  }
                  @if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
                    <app-badge variant="danger" class="product-card__badge">SALE</app-badge>
                  }
                </div>
                <div class="product-card__body">
                  <h3 class="product-card__name">{{ product.name }}</h3>
                  @if ((product.ratingsCount ?? 0) > 0) {
                    <app-rating-stars [value]="product.ratingsAvg ?? 0" />
                  }
                  <div class="product-card__price-row">
                    @if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
                      <span class="price-old">{{ product.price | currencyFormat }}</span>
                      <span class="price-sale">{{ product.priceAfterDiscount | currencyFormat }}</span>
                    } @else {
                      <span class="price">{{ product.price | currencyFormat }}</span>
                    }
                    <button class="cart-btn" (click)="addToCart($event, product)">🛒</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .category-page { padding-top: var(--header-height); padding-bottom: var(--space-16); }

    .category-hero { padding: var(--space-10) 0 var(--space-8); }
    .category-back { font-size: var(--text-sm); color: var(--color-accent); text-decoration: none; display: inline-block; margin-bottom: var(--space-4); &:hover { text-decoration: underline; } }
    .category-hero__title { font-size: var(--text-4xl); font-weight: var(--weight-extrabold); }
    .category-hero__desc { color: var(--color-text-tertiary); margin-top: var(--space-3); max-width: 600px; line-height: var(--leading-relaxed); }

    .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-5); padding-bottom: var(--space-8); }

    .product-card { border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; transition: transform var(--transition-normal), box-shadow var(--transition-normal); &:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); } }
    .product-card__img-wrap { position: relative; aspect-ratio: 1; background: var(--color-surface-alt); overflow: hidden; img { width:100%; height:100%; object-fit:cover; } }
    .product-card__no-img { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:48px; }
    .product-card__badge { position: absolute; top: var(--space-2); left: var(--space-2); }
    .product-card__body { padding: var(--space-4); }
    .product-card__name { font-weight: var(--weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-2); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .product-card__price-row { display:flex; align-items:center; justify-content:space-between; margin-top: var(--space-3); }
    .price { font-weight: var(--weight-bold); color: var(--color-text); }
    .price-sale { font-weight: var(--weight-bold); color: var(--color-error); }
    .price-old { font-size: var(--text-xs); color: var(--color-text-tertiary); text-decoration: line-through; margin-right: var(--space-1); }
    .cart-btn { width:32px; height:32px; border-radius:50%; background:var(--color-accent); color:white; border:none; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition: all var(--transition-fast); &:hover { background:var(--color-accent-hover); transform:scale(1.1); } }

    .cat-empty { text-align:center; padding: var(--space-16) 0; span { font-size:64px; display:block; margin-bottom:var(--space-4); } p { color:var(--color-text-tertiary); margin-bottom:var(--space-4); } a { color:var(--color-accent); text-decoration:none; &:hover { text-decoration:underline; } } }

    @media (max-width: 480px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class CategoryPageComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  protected readonly category = signal<Category | null>(null);
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly skeletons = Array(8).fill(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.categoryService.getCategory(id).subscribe({ next: (r) => this.category.set(r.data) });
    this.productService.getProducts({ category: id } as any).subscribe({
      next: (r) => { this.products.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.authService.isAuthenticated()) {
      this.cartService.addToCart(product._id).subscribe({ next: () => this.toast.success(`${product.name} added!`) });
    } else {
      this.cartService.addToGuestCart(product._id);
      this.toast.success(`${product.name} added!`);
    }
  }
}
