import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly orderService = inject(OrderService);

  protected readonly loading = signal(true);
  protected readonly stats = signal({ products: 0, categories: 0, orders: 0 });

  ngOnInit(): void {
    Promise.all([
      new Promise<number>(resolve => this.productService.getProducts({ limit: 10000 } as any).subscribe({ next: r => resolve(r.data?.length || 0), error: () => resolve(0) })),
      new Promise<number>(resolve => this.categoryService.getCategories().subscribe({ next: r => resolve(r.data?.length || 0), error: () => resolve(0) })),
      new Promise<number>(resolve => this.orderService.getOrders().subscribe({ next: r => resolve(r.data?.length || 0), error: () => resolve(0) }))
    ]).then(([products, categories, orders]) => {
      this.stats.set({ products, categories, orders });
      this.loading.set(false);
    });
  }
}
