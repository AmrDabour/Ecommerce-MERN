import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-content container" style="padding-top: calc(var(--header-height) + var(--space-8));">
      <div class="pl-layout">
        <!-- Sidebar Filters -->
        <aside class="pl-sidebar">
          <div class="pl-sidebar__header">
            <h2 class="pl-sidebar__title">Filters</h2>
            <button class="pl-sidebar__clear" (click)="clearFilters()">Clear all</button>
          </div>

          <!-- Category Filter -->
          <div class="pl-filter">
            <h3 class="pl-filter__title">Category</h3>
            <div class="pl-filter__list">
              <label class="pl-filter__item">
                <input type="radio" name="category" [value]="null" [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()" />
                <span>All Categories</span>
              </label>
              @for (cat of categories(); track cat._id) {
                <label class="pl-filter__item">
                  <input type="radio" name="category" [value]="cat._id" [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()" />
                  <span>{{ cat.name }}</span>
                </label>
              }
            </div>
          </div>

          <!-- Price Range -->
          <div class="pl-filter">
            <h3 class="pl-filter__title">Price Range</h3>
            <div class="pl-filter__price-row">
              <input type="number" class="pl-price-input" placeholder="Min $"
                [(ngModel)]="priceMin" (ngModelChange)="onFilterChange()" min="0" />
              <span class="pl-price-sep">–</span>
              <input type="number" class="pl-price-input" placeholder="Max $"
                [(ngModel)]="priceMax" (ngModelChange)="onFilterChange()" min="0" />
            </div>
          </div>

          <!-- Mobile close button -->
          <button class="pl-sidebar__close-btn" (click)="filterOpen.set(false)">
            ✕ Close filters
          </button>
        </aside>

        <!-- Main Content -->
        <div class="pl-main">
          <!-- Toolbar -->
          <div class="pl-toolbar">
            <div class="pl-toolbar__left">
              <button class="pl-mobile-filter-btn" (click)="filterOpen.set(true)">⚙ Filters</button>
              @if (!loading()) {
                <span class="pl-result-count">
                  {{ products().length }} product{{ products().length !== 1 ? 's' : '' }}
                </span>
              }
            </div>
            <div class="pl-toolbar__right">
              <select class="pl-sort-select" [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
                <option value="-createdAt">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-ratingsAvg">Top Rated</option>
              </select>
            </div>
          </div>

          <!-- Loading Skeleton -->
          @if (loading()) {
            <div class="pl-grid">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="pl-skeleton"></div>
              }
            </div>
          }

          <!-- Product Grid -->
          @if (!loading()) {
            @if (products().length === 0) {
              <div class="pl-empty">
                <div class="pl-empty__icon">🔍</div>
                <h3 class="pl-empty__title">No products found</h3>
                <p class="pl-empty__desc">Try adjusting your filters or search criteria</p>
                <button class="pl-empty__btn" (click)="clearFilters()">Clear filters</button>
              </div>
            } @else {
              <div class="pl-grid">
                @for (product of products(); track product._id) {
                  <div class="prod-card">
                    <a [routerLink]="['/products', product._id]" class="prod-card__img-wrap">
                      @if (product.imageCover) {
                        <img [src]="product.imageCover" [alt]="product.name" class="prod-card__img" loading="lazy" />
                      } @else {
                        <div class="prod-card__img-placeholder">📦</div>
                      }
                      @if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
                        <span class="prod-card__discount-badge">-{{ getDiscountPct(product) }}%</span>
                      }
                      @if (product.quantity === 0) {
                        <span class="prod-card__out-badge">Out of stock</span>
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
                        [disabled]="addingId() === product._id || product.quantity === 0"
                        (click)="addToCart(product)">
                        {{ product.quantity === 0 ? 'Out of stock' : addingId() === product._id ? 'Adding…' : '+ Add to cart' }}
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Pagination -->
              <div class="pl-pagination">
                <button class="pl-page-btn" [disabled]="currentPage() <= 1" (click)="prevPage()">← Previous</button>
                <span class="pl-page-info">Page {{ currentPage() }}</span>
                <button class="pl-page-btn" [disabled]="!hasNextPage()" (click)="nextPage()">Next →</button>
              </div>
            }
          }
        </div>
      </div>

      <!-- Mobile filter overlay -->
      @if (filterOpen()) {
        <div class="pl-overlay" (click)="filterOpen.set(false)"></div>
        <div class="pl-sidebar pl-sidebar--mobile-open"></div>
      }
    </div>
  `,
  styles: [`
    .pl-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    /* Sidebar */
    .pl-sidebar {
      position: sticky;
      top: calc(var(--header-height) + var(--space-4));
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
    }

    .pl-sidebar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
    }

    .pl-sidebar__title { font-size: var(--text-base); font-weight: var(--weight-bold); }

    .pl-sidebar__clear {
      font-size: var(--text-xs);
      color: var(--color-accent);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
      &:hover { text-decoration: underline; }
    }

    .pl-sidebar__close-btn {
      display: none;
      width: 100%;
      margin-top: var(--space-4);
      padding: var(--space-3);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-family: inherit;
    }

    .pl-filter { margin-bottom: var(--space-6); }
    .pl-filter__title {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      margin-bottom: var(--space-3);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pl-filter__list { display: flex; flex-direction: column; gap: var(--space-2); }

    .pl-filter__item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      cursor: pointer;
      color: var(--color-text-secondary);
      &:hover { color: var(--color-text); }

      input[type="radio"] { accent-color: var(--color-accent); }
    }

    .pl-filter__price-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .pl-price-input {
      flex: 1;
      min-width: 0;
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      font-family: inherit;
      background: var(--color-surface);
      color: var(--color-text);
      outline: none;
      &:focus { border-color: var(--color-accent); }
    }

    .pl-price-sep { color: var(--color-text-tertiary); font-size: var(--text-sm); }

    /* Toolbar */
    .pl-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
      gap: var(--space-4);
    }

    .pl-toolbar__left { display: flex; align-items: center; gap: var(--space-4); }

    .pl-mobile-filter-btn {
      display: none;
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      font-size: var(--text-sm);
      cursor: pointer;
      font-family: inherit;
    }

    .pl-result-count {
      font-size: var(--text-sm);
      color: var(--color-text-tertiary);
    }

    .pl-sort-select {
      padding: var(--space-2) var(--space-4);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      font-family: inherit;
      background: var(--color-surface);
      color: var(--color-text);
      cursor: pointer;
      outline: none;
      &:focus { border-color: var(--color-accent); }
    }

    /* Grid */
    .pl-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-5);
    }

    /* Product Card */
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
      font-size: 11px;
      font-weight: var(--weight-bold);
      border-radius: var(--radius-full);
    }

    .prod-card__out-badge {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.4);
      color: white;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
    }

    .prod-card__body { padding: var(--space-4); }

    .prod-card__rating { display: flex; align-items: center; gap: var(--space-1); margin-bottom: var(--space-2); }
    .prod-card__stars { color: #f59e0b; font-size: 12px; }
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

    .prod-card__pricing { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3); }
    .prod-card__price-current { font-size: var(--text-lg); font-weight: var(--weight-bold); }
    .prod-card__price-original { font-size: var(--text-sm); color: var(--color-text-tertiary); text-decoration: line-through; }

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

    /* Skeleton */
    .pl-skeleton {
      height: 320px;
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-lg);
    }

    /* Empty */
    .pl-empty {
      text-align: center;
      padding: var(--space-20) var(--space-8);
    }

    .pl-empty__icon { font-size: 3rem; margin-bottom: var(--space-4); }
    .pl-empty__title { font-size: var(--text-xl); font-weight: var(--weight-bold); margin-bottom: var(--space-2); }
    .pl-empty__desc { color: var(--color-text-tertiary); margin-bottom: var(--space-6); }
    .pl-empty__btn {
      padding: var(--space-3) var(--space-6);
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      cursor: pointer;
      font-family: inherit;
    }

    /* Pagination */
    .pl-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      margin-top: var(--space-10);
    }

    .pl-page-btn {
      padding: var(--space-2) var(--space-6);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      font-size: var(--text-sm);
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);
      &:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .pl-page-info { font-size: var(--text-sm); color: var(--color-text-secondary); font-weight: var(--weight-medium); }

    .pl-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 40;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 1024px) {
      .pl-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 767px) {
      .pl-layout { grid-template-columns: 1fr; }

      .pl-sidebar {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 50;
        overflow-y: auto;
        border-radius: 0;
        border: none;
        width: 280px;
        box-shadow: var(--shadow-xl);
      }

      .pl-sidebar--mobile-open {
        display: block;
      }

      .pl-sidebar__close-btn {
        display: block;
      }

      .pl-mobile-filter-btn {
        display: block;
      }
    }

    @media (max-width: 480px) {
      .pl-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly addingId = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly hasNextPage = signal(false);
  protected readonly filterOpen = signal(false);

  protected selectedCategory: string | null = null;
  protected priceMin: number | null = null;
  protected priceMax: number | null = null;
  protected sortBy = '-createdAt';
  private readonly limit = 12;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res.data),
    });

    // Check for pre-selected category from route
    const catId = this.route.snapshot.queryParamMap.get('category');
    if (catId) this.selectedCategory = catId;

    this.loadProducts();
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  protected onSortChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  protected prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadProducts();
    }
  }

  protected nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update((p) => p + 1);
      this.loadProducts();
    }
  }

  protected clearFilters(): void {
    this.selectedCategory = null;
    this.priceMin = null;
    this.priceMax = null;
    this.sortBy = '-createdAt';
    this.currentPage.set(1);
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const params: Record<string, string | number> = {
      page: this.currentPage(),
      limit: this.limit,
      sort: this.sortBy,
    };

    if (this.selectedCategory) params['category'] = this.selectedCategory;
    if (this.priceMin != null) params['price[gte]'] = this.priceMin;
    if (this.priceMax != null) params['price[lte]'] = this.priceMax;

    this.productService.getProducts(params as never).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.hasNextPage.set(res.results >= this.limit);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
        next: () => { this.addingId.set(null); this.toast.success('Added to cart!'); },
        error: () => { this.addingId.set(null); this.toast.error('Could not add to cart.'); },
      });
    } else {
      this.cartService.addToGuestCart(product._id);
      this.toast.success('Added to cart!');
    }
  }
}
