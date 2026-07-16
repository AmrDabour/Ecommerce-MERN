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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="home">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero__inner container">
          <div class="hero__content">
            <span class="hero__badge">New Season / 2026</span>
            <h1 class="hero__title">
              Discover premium
              <span class="hero__title-accent">modern essentials</span>
              for your lifestyle.
            </h1>
            <p class="hero__subtitle">
              Carefully curated electronics, audio gear, wearables, and home decor
              designed for creators, teams, and everyday productivity.
            </p>
            <div class="hero__actions">
              <a routerLink="/products" class="hero__cta hero__cta--primary">Shop Collection</a>
              <a routerLink="/products" class="hero__cta hero__cta--secondary">Browse Deals</a>
            </div>
          </div>

          <div class="hero__visual">
            <div class="hero__card hero__card--main">
              <div class="hero__card-badge">Best Seller</div>
              <div class="hero__card-name">Premium Products</div>
              <div class="hero__card-price">Starting at $9.99</div>
            </div>
            <div class="hero__card hero__card--accent">
              <div class="hero__card-label">Limited Offer</div>
              <div class="hero__card-discount">Up to 40% OFF</div>
              <div class="hero__card-note">On selected categories this week</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Strip -->
      <section class="stats container">
        <div class="stats__grid">
          <div class="stats__item">
            <span class="stats__number">500+</span>
            <span class="stats__label">Products</span>
          </div>
          <div class="stats__item">
            <span class="stats__number">10k+</span>
            <span class="stats__label">Happy Customers</span>
          </div>
          <div class="stats__item">
            <span class="stats__number">4.9</span>
            <span class="stats__label">Average Rating</span>
          </div>
          <div class="stats__item">
            <span class="stats__number">Free</span>
            <span class="stats__label">Shipping Over $50</span>
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="section container">
        <h2 class="section__title">Shop by Category</h2>
        <p class="section__subtitle">Browse our handpicked collections</p>

        @if (loadingCategories()) {
          <div class="cat-grid">
            @for (i of [1,2,3,4]; track i) {
              <div class="cat-skeleton"></div>
            }
          </div>
        } @else if (categories().length > 0) {
          <div class="cat-grid">
            @for (cat of categories(); track cat._id) {
              <a [routerLink]="['/categories', cat._id]" class="cat-card">
                @if (cat.image) {
                  <img [src]="cat.image" [alt]="cat.name" class="cat-card__img" loading="lazy" />
                } @else {
                  <div class="cat-card__placeholder">🏷️</div>
                }
                <span class="cat-card__name">{{ cat.name }}</span>
              </a>
            }
          </div>
        }
      </section>

      <!-- Featured Products -->
      <section class="section section--alt">
        <div class="container">
          <h2 class="section__title">Featured Products</h2>
          <p class="section__subtitle">Top picks selected just for you</p>

          @if (loadingProducts()) {
            <div class="prod-grid">
              @for (i of [1,2,3,4]; track i) {
                <div class="prod-skeleton"></div>
              }
            </div>
          } @else if (featuredProducts().length > 0) {
            <div class="prod-grid">
              @for (product of featuredProducts(); track product._id) {
                <div class="prod-card">
                  <a [routerLink]="['/products', product._id]" class="prod-card__img-wrap">
                    @if (product.imageCover) {
                      <img [src]="product.imageCover" [alt]="product.name" class="prod-card__img" loading="lazy" />
                    } @else {
                      <div class="prod-card__img-placeholder">📦</div>
                    }
                    @if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
                      <span class="prod-card__discount-badge">
                        -{{ getDiscountPct(product) }}%
                      </span>
                    }
                  </a>
                  <div class="prod-card__body">
                    <div class="prod-card__rating">
                      <span class="prod-card__stars">{{ getStars(product.ratingsAvg) }}</span>
                      <span class="prod-card__rating-count">({{ product.ratingsCount ?? 0 }})</span>
                    </div>
                    <a [routerLink]="['/products', product._id]" class="prod-card__name">{{ product.name }}</a>
                    <div class="prod-card__pricing">
                      @if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
                        <span class="prod-card__price-current">\${{ product.priceAfterDiscount.toFixed(2) }}</span>
                        <span class="prod-card__price-original">\${{ product.price.toFixed(2) }}</span>
                      } @else {
                        <span class="prod-card__price-current">\${{ product.price.toFixed(2) }}</span>
                      }
                    </div>
                    <button class="prod-card__add-btn"
                      [class.prod-card__add-btn--adding]="addingId() === product._id"
                      [disabled]="addingId() === product._id || product.quantity === 0"
                      (click)="addToCart(product)">
                      {{ product.quantity === 0 ? 'Out of stock' : addingId() === product._id ? 'Adding…' : 'Add to cart' }}
                    </button>
                  </div>
                </div>
              }
            </div>
            <div class="section__cta-wrap">
              <a routerLink="/products" class="section__cta">View All Products →</a>
            </div>
          }
        </div>
      </section>

      <!-- Trust Badges -->
      <div class="trust-wrap">
        <section class="trust container">
          <div class="trust__grid">
            <div class="trust__item">
              <div class="trust__icon-wrap">
                <img src="https://img.icons8.com/fluency/96/truck.png" alt="Free Shipping" class="trust__icon-img">
              </div>
              <strong class="trust__title">Free Shipping</strong>
              <span class="trust__desc">On all orders over $50. Fast & reliable delivery.</span>
            </div>
            <div class="trust__item">
              <div class="trust__icon-wrap">
                <img src="https://img.icons8.com/fluency/96/refresh.png" alt="Easy Returns" class="trust__icon-img">
              </div>
              <strong class="trust__title">Easy Returns</strong>
              <span class="trust__desc">30-day hassle-free return policy for peace of mind.</span>
            </div>
            <div class="trust__item">
              <div class="trust__icon-wrap">
                <img src="https://img.icons8.com/fluency/96/shield.png" alt="Secure Payment" class="trust__icon-img">
              </div>
              <strong class="trust__title">Secure Payment</strong>
              <span class="trust__desc">100% protected checkout with 256-bit encryption.</span>
            </div>
            <div class="trust__item">
              <div class="trust__icon-wrap">
                <img src="https://img.icons8.com/fluency/96/prize.png" alt="Top Quality" class="trust__icon-img">
              </div>
              <strong class="trust__title">Premium Quality</strong>
              <span class="trust__desc">Carefully curated products from top-tier brands.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .home {
      padding-top: var(--header-height);
    }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, var(--color-accent-lighter) 0%, var(--color-surface) 60%);
      padding: var(--space-20) 0;
    }

    .hero__inner {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: var(--space-12);
      align-items: center;
    }

    .hero__badge {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      border: 1px solid var(--color-accent);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--color-accent);
    }

    .hero__title {
      margin-top: var(--space-6);
      font-size: var(--text-5xl);
      font-weight: var(--weight-extrabold);
      line-height: 1.1;
      color: var(--color-text);
    }

    .hero__title-accent { color: var(--color-accent); }

    .hero__subtitle {
      margin-top: var(--space-5);
      font-size: var(--text-lg);
      color: var(--color-text-secondary);
      max-width: 500px;
      line-height: var(--leading-relaxed);
    }

    .hero__actions {
      margin-top: var(--space-8);
      display: flex;
      gap: var(--space-4);
    }

    .hero__cta {
      display: inline-flex;
      align-items: center;
      padding: var(--space-4) var(--space-8);
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .hero__cta--primary {
      background: var(--color-accent);
      color: var(--color-text-inverse);
      &:hover { background: var(--color-accent-hover); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    }

    .hero__cta--secondary {
      border: 1.5px solid var(--color-border);
      color: var(--color-text);
      &:hover { border-color: var(--color-accent); color: var(--color-accent); }
    }

    .hero__visual {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .hero__card {
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      animation: fadeInUp 600ms ease both;
    }

    .hero__card--main {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      animation-delay: 200ms;
    }

    .hero__card--accent {
      background: var(--color-accent-light);
      border: 1px solid rgba(4, 120, 87, 0.15);
      animation-delay: 400ms;
    }

    .hero__card-badge, .hero__card-label {
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--color-text-tertiary);
    }

    .hero__card-label { color: var(--color-accent); }

    .hero__card-name {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      margin-top: var(--space-2);
    }

    .hero__card-price, .hero__card-discount {
      font-size: var(--text-2xl);
      font-weight: var(--weight-extrabold);
      margin-top: var(--space-2);
    }

    .hero__card-discount { color: var(--color-accent); }

    .hero__card-note {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      margin-top: var(--space-1);
    }

    /* Stats */
    .stats { padding: var(--space-12) 0; }

    .stats__grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
      text-align: center;
    }

    .stats__number {
      display: block;
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      color: var(--color-text);
      font-family: var(--font-display);
    }

    .stats__label {
      display: block;
      font-size: var(--text-sm);
      color: var(--color-text-tertiary);
      margin-top: var(--space-1);
    }

    /* Sections */
    .section { padding: var(--space-16) 0; }
    .section--alt { background: var(--color-surface-alt); }

    .section__title {
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      text-align: center;
    }

    .section__subtitle {
      text-align: center;
      color: var(--color-text-tertiary);
      margin-top: var(--space-2);
    }

    .section__cta-wrap { text-align: center; margin-top: var(--space-10); }
    .section__cta {
      display: inline-flex;
      align-items: center;
      padding: var(--space-3) var(--space-8);
      border: 1.5px solid var(--color-accent);
      border-radius: var(--radius-full);
      color: var(--color-accent);
      font-weight: var(--weight-semibold);
      text-decoration: none;
      transition: all var(--transition-fast);
      font-size: var(--text-sm);
      &:hover { background: var(--color-accent); color: white; }
    }

    /* Category grid */
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
      margin-top: var(--space-10);
    }

    .cat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-6);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all var(--transition-normal);
      color: var(--color-text);
      &:hover { border-color: var(--color-accent); transform: translateY(-4px); box-shadow: var(--shadow-md); }
    }

    .cat-card__img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--radius-md);
    }

    .cat-card__placeholder {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-accent-lighter);
      border-radius: var(--radius-md);
      font-size: 2rem;
    }

    .cat-card__name {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      text-align: center;
    }

    .cat-skeleton {
      height: 160px;
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-lg);
    }

    /* Product grid */
    .prod-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-6);
      margin-top: var(--space-10);
    }

    .prod-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all var(--transition-normal);
      &:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
    }

    .prod-card__img-wrap {
      position: relative;
      display: block;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--color-surface-alt);
    }

    .prod-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-normal);
      .prod-card:hover & { transform: scale(1.05); }
    }

    .prod-card__img-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
    }

    .prod-card__discount-badge {
      position: absolute;
      top: var(--space-3);
      left: var(--space-3);
      padding: 2px 8px;
      background: var(--color-error);
      color: white;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      border-radius: var(--radius-full);
    }

    .prod-card__body { padding: var(--space-4); }

    .prod-card__rating {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      margin-bottom: var(--space-2);
    }

    .prod-card__stars { color: #f59e0b; font-size: var(--text-xs); }
    .prod-card__rating-count { font-size: var(--text-xs); color: var(--color-text-tertiary); }

    .prod-card__name {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text);
      text-decoration: none;
      margin-bottom: var(--space-3);
      line-height: var(--leading-snug);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      &:hover { color: var(--color-accent); }
    }

    .prod-card__pricing {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .prod-card__price-current {
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--color-text);
    }

    .prod-card__price-original {
      font-size: var(--text-sm);
      color: var(--color-text-tertiary);
      text-decoration: line-through;
    }

    .prod-card__add-btn {
      width: 100%;
      padding: var(--space-2) var(--space-4);
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: inherit;
      &:hover:not(:disabled) { background: var(--color-accent-hover); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .prod-skeleton {
      height: 320px;
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-lg);
    }

    /* Trust */
    .trust-wrap {
      background: var(--color-surface-alt);
      padding: var(--space-20) 0;
      /* Removed margin-top and border-top so it merges with the section above */
    }
    .trust { padding: 0; }

    .trust__grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-8);
      text-align: center;
    }

    .trust__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-8) var(--space-6);
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
      &:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-lg);
        border-color: var(--color-accent);
      }
    }

    .trust__icon-wrap {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(4, 120, 87, 0.05);
      border-radius: 50%;
      margin-bottom: var(--space-2);
    }
    
    .trust__icon-img {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }

    .trust__title { font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--color-text); }
    .trust__desc { font-size: var(--text-sm); color: var(--color-text-secondary); line-height: 1.5; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 1024px) {
      .hero__title { font-size: var(--text-4xl); }
      .cat-grid, .prod-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 767px) {
      .hero { padding: var(--space-12) 0; }
      .hero__inner { grid-template-columns: 1fr; gap: var(--space-8); }
      .hero__title { font-size: var(--text-3xl); }
      .hero__actions { flex-direction: column; }
      .hero__cta { justify-content: center; }
      .stats__grid { grid-template-columns: repeat(2, 1fr); }
      .cat-grid { grid-template-columns: repeat(2, 1fr); }
      .prod-grid { grid-template-columns: repeat(2, 1fr); }
      .trust__grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 480px) {
      .cat-grid { grid-template-columns: repeat(2, 1fr); }
      .prod-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class HomeComponent implements OnInit {
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
