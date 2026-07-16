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
  template: `
    <div class="dashboard">
      <h1 class="dashboard__title">Admin Dashboard</h1>

      @if (loading()) {
        <div class="stats-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="stat-card skeleton"></div>
          }
        </div>
      } @else {
        <div class="stats-grid">
          <!-- Total Products -->
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--blue">🛍</div>
            <div class="stat-card__info">
              <div class="stat-card__value">{{ stats().products }}</div>
              <div class="stat-card__label">Total Products</div>
            </div>
            <a routerLink="/admin/products" class="stat-card__link">View All →</a>
          </div>

          <!-- Total Categories -->
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--green">📁</div>
            <div class="stat-card__info">
              <div class="stat-card__value">{{ stats().categories }}</div>
              <div class="stat-card__label">Categories</div>
            </div>
            <a routerLink="/admin/categories" class="stat-card__link">View All →</a>
          </div>

          <!-- Total Orders -->
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--purple">📦</div>
            <div class="stat-card__info">
              <div class="stat-card__value">{{ stats().orders }}</div>
              <div class="stat-card__label">Recent Orders</div>
            </div>
            <a routerLink="/admin/orders" class="stat-card__link">View All →</a>
          </div>

          <!-- Revenue (Mock) -->
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--yellow">💰</div>
            <div class="stat-card__info">
              <div class="stat-card__value">\${{ (stats().orders * 125).toFixed(0) }}</div>
              <div class="stat-card__label">Est. Revenue</div>
            </div>
          </div>
        </div>
      }

      <div class="dashboard-cards">
        <div class="dash-panel">
          <h2 class="dash-panel__title">Quick Actions</h2>
          <div class="action-grid">
            <a routerLink="/admin/products" class="action-btn">
              <span class="action-btn__icon">+</span> Add New Product
            </a>
            <a routerLink="/admin/categories" class="action-btn">
              <span class="action-btn__icon">+</span> Add Category
            </a>
            <a routerLink="/admin/coupons" class="action-btn">
              <span class="action-btn__icon">🏷</span> Manage Coupons
            </a>
          </div>
        </div>

        <div class="dash-panel">
          <h2 class="dash-panel__title">System Status</h2>
          <ul class="status-list">
            <li class="status-item">
              <span class="status-dot status-dot--active"></span>
              API Connection <span class="status-ok">Operational</span>
            </li>
            <li class="status-item">
              <span class="status-dot status-dot--active"></span>
              Database <span class="status-ok">Connected</span>
            </li>
            <li class="status-item">
              <span class="status-dot status-dot--warning"></span>
              Payment Gateway <span class="status-warn">Test Mode</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard__title { font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-6); color: var(--color-text); }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-8); }

    .stat-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); display: flex; align-items: flex-start; gap: var(--space-4); position: relative; transition: box-shadow var(--transition-fast); &:hover { box-shadow: var(--shadow-sm); } }
    .stat-card.skeleton { height: 120px; background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }

    .stat-card__icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
    .stat-card__icon--blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stat-card__icon--green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .stat-card__icon--purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
    .stat-card__icon--yellow { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

    .stat-card__info { flex: 1; }
    .stat-card__value { font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--color-text); line-height: 1.2; margin-bottom: 2px; }
    .stat-card__label { font-size: var(--text-sm); color: var(--color-text-tertiary); font-weight: var(--weight-medium); }

    .stat-card__link { position: absolute; bottom: var(--space-4); right: var(--space-4); font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-accent); text-decoration: none; &:hover { text-decoration: underline; } }

    .dashboard-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6); }
    .dash-panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); }
    .dash-panel__title { font-size: var(--text-lg); font-weight: var(--weight-bold); margin-bottom: var(--space-5); color: var(--color-text); }

    .action-grid { display: flex; flex-direction: column; gap: var(--space-3); }
    .action-btn { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); text-decoration: none; transition: all var(--transition-fast); &:hover { background: var(--color-border); border-color: var(--color-text-tertiary); } }
    .action-btn__icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--color-surface); border-radius: 4px; border: 1px solid var(--color-border); font-weight: bold; }

    .status-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-4); }
    .status-item { display: flex; align-items: center; font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-secondary); }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: var(--space-3); }
    .status-dot--active { background: var(--color-success); box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
    .status-dot--warning { background: var(--color-warning); box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
    .status-ok { margin-left: auto; font-size: var(--text-xs); color: var(--color-success); }
    .status-warn { margin-left: auto; font-size: var(--text-xs); color: var(--color-warning); }

    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `],
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
