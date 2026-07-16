import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ReviewService } from '../../../core/services/review.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Product } from '../../../core/models/product.model';
import { Review } from '../../../core/models/review.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-content container" style="padding-top: calc(var(--header-height) + var(--space-8));">
      @if (loading()) {
        <div class="pd-skeleton-layout">
          <div class="pd-skeleton-img"></div>
          <div class="pd-skeleton-info">
            @for (i of [1,2,3,4,5]; track i) { <div class="pd-skeleton-line" [style.width]="i === 1 ? '60%' : i === 2 ? '40%' : '100%'"></div> }
          </div>
        </div>
      } @else if (product()) {
        <nav class="pd-breadcrumb">
          <a routerLink="/" class="pd-breadcrumb__link">Home</a>
          <span class="pd-breadcrumb__sep">›</span>
          <a routerLink="/products" class="pd-breadcrumb__link">Products</a>
          <span class="pd-breadcrumb__sep">›</span>
          <span class="pd-breadcrumb__current">{{ product()!.name }}</span>
        </nav>

        <div class="pd-layout">
          <!-- Image -->
          <div class="pd-image-wrap">
            @if (product()!.imageCover) {
              <img [src]="product()!.imageCover" [alt]="product()!.name" class="pd-image" />
            } @else {
              <div class="pd-image-placeholder">📦</div>
            }
            @if (product()!.priceAfterDiscount && product()!.priceAfterDiscount! < product()!.price) {
              <span class="pd-discount-badge">-{{ getDiscountPct() }}%</span>
            }
          </div>

          <!-- Info -->
          <div class="pd-info">
            <div class="pd-info__category">
              {{ getCategoryName() }}
            </div>

            <h1 class="pd-info__name">{{ product()!.name }}</h1>

            <div class="pd-info__rating">
              <span class="pd-stars">{{ getStars(product()!.ratingsAvg) }}</span>
              <span class="pd-rating-num">{{ product()!.ratingsAvg?.toFixed(1) ?? '0.0' }}</span>
              <span class="pd-rating-count">({{ product()!.ratingsCount ?? 0 }} reviews)</span>
            </div>

            <div class="pd-info__pricing">
              @if (product()!.priceAfterDiscount && product()!.priceAfterDiscount! < product()!.price) {
                <span class="pd-price-current">\${{ product()!.priceAfterDiscount!.toFixed(2) }}</span>
                <span class="pd-price-original">\${{ product()!.price.toFixed(2) }}</span>
                <span class="pd-price-save">Save \${{ (product()!.price - product()!.priceAfterDiscount!).toFixed(2) }}</span>
              } @else {
                <span class="pd-price-current">\${{ product()!.price.toFixed(2) }}</span>
              }
            </div>

            <div class="pd-info__stock">
              @if (product()!.quantity > 0) {
                <span class="pd-in-stock">✓ In stock ({{ product()!.quantity }} available)</span>
              } @else {
                <span class="pd-out-stock">✗ Out of stock</span>
              }
            </div>

            <p class="pd-info__desc">{{ product()!.description }}</p>

            <!-- Quantity + Add to cart -->
            <div class="pd-actions">
              <div class="pd-qty">
                <button class="pd-qty__btn" (click)="decreaseQty()" [disabled]="qty() <= 1">−</button>
                <span class="pd-qty__value">{{ qty() }}</span>
                <button class="pd-qty__btn" (click)="increaseQty()" [disabled]="qty() >= (product()!.quantity || 1)">+</button>
              </div>
              <button class="pd-add-btn"
                [disabled]="adding() || product()!.quantity === 0"
                (click)="addToCart()">
                @if (adding()) { <span class="pd-spinner"></span> }
                {{ adding() ? 'Adding…' : product()!.quantity === 0 ? 'Out of stock' : 'Add to cart' }}
              </button>
            </div>

            <!-- Meta -->
            <div class="pd-meta">
              @if (product()!.sold) {
                <div class="pd-meta__item"><span>Sold:</span> {{ product()!.sold }} units</div>
              }
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <section class="pd-reviews">
          <h2 class="pd-reviews__title">Customer Reviews ({{ reviews().length }})</h2>

          <!-- Write a review -->
          @if (auth.isAuthenticated()) {
            <div class="pd-review-form">
              <h3 class="pd-review-form__title">Write a Review</h3>
              <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                <div class="pd-review-form__stars">
                  <span class="pd-review-form__label">Rating:</span>
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" class="pd-star-btn"
                      [class.pd-star-btn--active]="(reviewForm.get('rating')?.value ?? 0) >= star"
                      (click)="setRating(star)">★</button>
                  }
                </div>
                <textarea class="pd-review-textarea" formControlName="comment"
                  placeholder="Share your experience with this product…" rows="4"></textarea>
                @if (reviewForm.get('comment')?.invalid && reviewForm.get('comment')?.touched) {
                  <span class="pd-form-error">Please write a review comment.</span>
                }
                <button type="submit" class="pd-review-submit"
                  [disabled]="reviewForm.invalid || submittingReview()">
                  {{ submittingReview() ? 'Submitting…' : 'Submit Review' }}
                </button>
              </form>
            </div>
          } @else {
            <div class="pd-review-login">
              <a routerLink="/login" class="pd-review-login__link">Sign in to write a review</a>
            </div>
          }

          <!-- Reviews List -->
          @if (loadingReviews()) {
            <div class="pd-reviews-loading">Loading reviews…</div>
          } @else if (reviews().length === 0) {
            <div class="pd-no-reviews">No reviews yet. Be the first to review this product!</div>
          } @else {
            <div class="pd-review-list">
              @for (review of reviews(); track review._id) {
                <div class="pd-review-item">
                  <div class="pd-review-header">
                    <div class="pd-review-avatar">
                      {{ getUserName(review).charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="pd-review-name">{{ getUserName(review) }}</div>
                      <div class="pd-review-stars">{{ getStars(review.rating) }}</div>
                    </div>
                    <div class="pd-review-date">{{ formatDate(review.createdAt) }}</div>
                  </div>
                  @if (review.comment) {
                    <p class="pd-review-comment">{{ review.comment }}</p>
                  }
                </div>
              }
            </div>
          }
        </section>
      } @else if (!loading()) {
        <div class="pd-not-found">
          <div style="font-size: 3rem;">😔</div>
          <h2>Product not found</h2>
          <a routerLink="/products" class="pd-back-link">← Back to Products</a>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Breadcrumb */
    .pd-breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-8);
      font-size: var(--text-sm);
    }

    .pd-breadcrumb__link {
      color: var(--color-text-tertiary);
      text-decoration: none;
      &:hover { color: var(--color-accent); }
    }

    .pd-breadcrumb__sep { color: var(--color-border); }
    .pd-breadcrumb__current { color: var(--color-text); font-weight: var(--weight-medium); }

    /* Layout */
    .pd-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-12);
      margin-bottom: var(--space-16);
    }

    /* Image */
    .pd-image-wrap {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: var(--color-surface-alt);
      aspect-ratio: 1;
    }

    .pd-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .pd-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 5rem;
    }

    .pd-discount-badge {
      position: absolute;
      top: var(--space-4);
      left: var(--space-4);
      padding: var(--space-1) var(--space-3);
      background: var(--color-error);
      color: white;
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      border-radius: var(--radius-full);
    }

    /* Info */
    .pd-info { display: flex; flex-direction: column; gap: var(--space-4); }

    .pd-info__category {
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-accent);
      font-weight: var(--weight-semibold);
    }

    .pd-info__name {
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      line-height: var(--leading-tight);
      color: var(--color-text);
    }

    .pd-info__rating {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .pd-stars { color: #f59e0b; }
    .pd-rating-num { font-weight: var(--weight-semibold); font-size: var(--text-sm); }
    .pd-rating-count { font-size: var(--text-sm); color: var(--color-text-tertiary); }

    .pd-info__pricing { display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }
    .pd-price-current { font-size: var(--text-3xl); font-weight: var(--weight-extrabold); color: var(--color-text); }
    .pd-price-original { font-size: var(--text-lg); color: var(--color-text-tertiary); text-decoration: line-through; }
    .pd-price-save {
      padding: 2px 10px;
      background: var(--color-error-light);
      color: var(--color-error);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
    }

    .pd-in-stock { color: var(--color-success); font-size: var(--text-sm); font-weight: var(--weight-medium); }
    .pd-out-stock { color: var(--color-error); font-size: var(--text-sm); font-weight: var(--weight-medium); }

    .pd-info__desc {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      line-height: var(--leading-relaxed);
      padding: var(--space-4) 0;
      border-top: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
    }

    /* Actions */
    .pd-actions {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .pd-qty {
      display: flex;
      align-items: center;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .pd-qty__btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xl);
      background: var(--color-surface-alt);
      border: none;
      cursor: pointer;
      transition: background var(--transition-fast);
      font-family: inherit;
      &:hover:not(:disabled) { background: var(--color-border); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    }

    .pd-qty__value {
      width: 56px;
      text-align: center;
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
    }

    .pd-add-btn {
      flex: 1;
      padding: var(--space-3) var(--space-8);
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      min-height: 48px;
      &:hover:not(:disabled) { background: var(--color-accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }

    .pd-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    .pd-meta { font-size: var(--text-sm); color: var(--color-text-secondary); }
    .pd-meta__item { display: flex; gap: var(--space-2); margin-top: var(--space-1); }

    /* Reviews */
    .pd-reviews {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-10);
      margin-top: var(--space-4);
    }

    .pd-reviews__title {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      margin-bottom: var(--space-8);
    }

    .pd-review-form {
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      margin-bottom: var(--space-8);
    }

    .pd-review-form__title {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      margin-bottom: var(--space-4);
    }

    .pd-review-form__stars {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      margin-bottom: var(--space-4);
    }

    .pd-review-form__label {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      margin-right: var(--space-2);
    }

    .pd-star-btn {
      font-size: 1.5rem;
      color: var(--color-border);
      background: none;
      border: none;
      cursor: pointer;
      transition: color var(--transition-fast), transform var(--transition-fast);
      &:hover, &.pd-star-btn--active { color: #f59e0b; transform: scale(1.1); }
    }

    .pd-review-textarea {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-family: inherit;
      background: var(--color-surface);
      color: var(--color-text);
      resize: vertical;
      outline: none;
      &:focus { border-color: var(--color-accent); }
      box-sizing: border-box;
    }

    .pd-form-error { font-size: var(--text-xs); color: var(--color-error); display: block; margin-top: var(--space-1); }

    .pd-review-submit {
      margin-top: var(--space-4);
      padding: var(--space-3) var(--space-6);
      background: var(--color-accent);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);
      &:hover:not(:disabled) { background: var(--color-accent-hover); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .pd-review-login {
      margin-bottom: var(--space-8);
      padding: var(--space-4);
      background: var(--color-accent-lighter);
      border-radius: var(--radius-md);
      text-align: center;
    }

    .pd-review-login__link {
      color: var(--color-accent);
      font-weight: var(--weight-medium);
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }

    .pd-review-list { display: flex; flex-direction: column; gap: var(--space-6); }

    .pd-review-item {
      padding: var(--space-6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
    }

    .pd-review-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .pd-review-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      flex-shrink: 0;
    }

    .pd-review-name { font-size: var(--text-sm); font-weight: var(--weight-semibold); }
    .pd-review-stars { font-size: var(--text-xs); color: #f59e0b; }
    .pd-review-date { margin-left: auto; font-size: var(--text-xs); color: var(--color-text-tertiary); }
    .pd-review-comment { font-size: var(--text-sm); color: var(--color-text-secondary); line-height: var(--leading-relaxed); }

    .pd-reviews-loading, .pd-no-reviews {
      text-align: center;
      padding: var(--space-8);
      color: var(--color-text-tertiary);
    }

    /* Skeleton */
    .pd-skeleton-layout { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); margin-bottom: var(--space-16); }
    .pd-skeleton-img {
      aspect-ratio: 1;
      border-radius: var(--radius-xl);
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .pd-skeleton-info { display: flex; flex-direction: column; gap: var(--space-4); padding-top: var(--space-4); }
    .pd-skeleton-line {
      height: 20px;
      border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .pd-not-found { text-align: center; padding: var(--space-20); }
    .pd-back-link { color: var(--color-accent); text-decoration: none; &:hover { text-decoration: underline; } }

    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 767px) {
      .pd-layout { grid-template-columns: 1fr; gap: var(--space-6); }
      .pd-skeleton-layout { grid-template-columns: 1fr; }
      .pd-info__name { font-size: var(--text-2xl); }
    }
  `],
})
export class ProductDetailsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly reviewService = inject(ReviewService);
  private readonly cartService = inject(CartService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly product = signal<Product | null>(null);
  protected readonly reviews = signal<Review[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingReviews = signal(true);
  protected readonly adding = signal(false);
  protected readonly submittingReview = signal(false);
  protected readonly qty = signal(1);

  protected readonly reviewForm = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1)]],
    comment: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.productService.getProduct(id).subscribe({
      next: (res) => {
        this.product.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.reviewService.getReviews(id).subscribe({
      next: (res) => {
        this.reviews.set(res.data);
        this.loadingReviews.set(false);
      },
      error: () => this.loadingReviews.set(false),
    });
  }

  protected getDiscountPct(): number {
    const p = this.product();
    if (!p?.priceAfterDiscount) return 0;
    return Math.round((1 - p.priceAfterDiscount / p.price) * 100);
  }

  protected getStars(avg?: number): string {
    const n = Math.round(avg ?? 0);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  protected getCategoryName(): string {
    const cat = this.product()?.category;
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    return (cat as { name: string }).name;
  }

  protected getUserName(review: Review): string {
    if (typeof review.user === 'string') return 'Customer';
    return (review.user as User).name ?? 'Customer';
  }

  protected formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  protected setRating(star: number): void {
    this.reviewForm.get('rating')?.setValue(star);
  }

  protected increaseQty(): void {
    const max = this.product()?.quantity ?? 1;
    if (this.qty() < max) this.qty.update((q) => q + 1);
  }

  protected decreaseQty(): void {
    if (this.qty() > 1) this.qty.update((q) => q - 1);
  }

  protected addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.adding.set(true);

    if (this.auth.isAuthenticated()) {
      this.cartService.addToCart(p._id).subscribe({
        next: () => { this.adding.set(false); this.toast.success('Added to cart!'); },
        error: () => { this.adding.set(false); this.toast.error('Could not add to cart.'); },
      });
    } else {
      for (let i = 0; i < this.qty(); i++) {
        this.cartService.addToGuestCart(p._id);
      }
      this.adding.set(false);
      this.toast.success('Added to cart!');
    }
  }

  protected submitReview(): void {
    if (this.reviewForm.invalid) { this.reviewForm.markAllAsTouched(); return; }
    const productId = this.route.snapshot.paramMap.get('id')!;
    this.submittingReview.set(true);

    const { rating, comment } = this.reviewForm.value;
    this.reviewService.createReview({ rating: rating!, comment: comment!, product: productId }).subscribe({
      next: (res) => {
        this.reviews.update((rs) => [res.data, ...rs]);
        this.reviewForm.reset({ rating: 0, comment: '' });
        this.submittingReview.set(false);
        this.toast.success('Review submitted!');
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.toast.error(err?.error?.msg ?? 'Could not submit review.');
      },
    });
  }
}
