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
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  protected readonly wishlistService = inject(WishlistService);
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
  protected searchKeyword: string | null = null;
  protected priceMin: number | null = null;
  protected priceMax: number | null = null;
  protected sortBy = '-createdAt';
  private readonly limit = 12;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res.data),
    });

    this.route.queryParams.subscribe(params => {
      const cat = params['category'];
      this.selectedCategory = cat === 'null' ? null : cat || null;
      this.searchKeyword = params['keyword'] || null;
      this.currentPage.set(1);
      this.loadProducts();
    });
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
    this.searchKeyword = null;
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
    if (this.searchKeyword) params['keyword'] = this.searchKeyword;
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

  protected toggleWishlist(product: Product): void {
    if (!this.authService.isAuthenticated()) {
      this.toast.error('Please login to add to wishlist');
      return;
    }
    
    if (this.wishlistService.isInWishlist(product._id)) {
      this.wishlistService.removeFromWishlist(product._id).subscribe({
        next: () => this.toast.success('Removed from wishlist')
      });
    } else {
      this.wishlistService.addToWishlist(product._id).subscribe({
        next: () => this.toast.success('Added to wishlist')
      });
    }
  }
}
