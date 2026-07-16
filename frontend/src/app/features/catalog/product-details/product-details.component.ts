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
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
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
  protected readonly activeImage = signal<string>('');
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
        if (res.data.imageCover) {
          this.activeImage.set(res.data.imageCover);
        }
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

  protected setActiveImage(url: string): void {
    this.activeImage.set(url);
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
