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
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss',
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
