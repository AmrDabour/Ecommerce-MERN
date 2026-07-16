import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [RouterLink, CurrencyFormatPipe, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-content container" style="padding-top: calc(var(--header-height) + var(--space-8));">
      <h1 class="page-title">My Orders</h1>

      @if (loading()) {
        <div class="orders-list">
          @for (i of [1,2,3]; track i) {
            <div class="order-card-skeleton"></div>
          }
        </div>
      } @else if (orders().length === 0) {
        <div class="orders-empty">
          <div class="orders-empty__icon">📦</div>
          <h2 class="orders-empty__title">No orders yet</h2>
          <p class="orders-empty__desc">You haven't placed any orders yet. Start exploring our collection!</p>
          <a routerLink="/products" class="orders-empty__btn">Shop Now</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order._id) {
            <div class="order-card">
              <div class="order-card__header">
                <div class="order-card__id-group">
                  <span class="order-card__label">Order ID:</span>
                  <span class="order-card__id">{{ order._id.slice(0, 8) }}</span>
                </div>
                <div class="order-card__date">{{ formatDate(order.createdAt) }}</div>
              </div>

              <div class="order-card__body">
                <div class="order-card__status-col">
                  <div class="order-card__label">Status</div>
                  <div class="order-card__badges">
                    @if (order.isPaid) {
                      <app-badge variant="success" pill>✓ Paid</app-badge>
                    } @else {
                      <app-badge variant="warning" pill>Unpaid</app-badge>
                    }
                    @if (order.isDelivered) {
                      <app-badge variant="success" pill>✓ Delivered</app-badge>
                    } @else {
                      <app-badge variant="info" pill>In Transit</app-badge>
                    }
                  </div>
                </div>

                <div class="order-card__total-col">
                  <div class="order-card__label">Total Amount</div>
                  <div class="order-card__total">{{ order.totalPrice | currencyFormat }}</div>
                </div>

                <div class="order-card__items-col">
                  <div class="order-card__label">Items</div>
                  <div class="order-card__items-count">{{ order.orderItems.length }} item(s)</div>
                </div>
              </div>

              <div class="order-card__footer">
                <a [routerLink]="['/orders', order._id]" class="order-card__btn">View Details →</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title {
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      margin-bottom: var(--space-8);
    }

    .orders-list { display: flex; flex-direction: column; gap: var(--space-4); }

    .order-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5) var(--space-6);
      transition: box-shadow var(--transition-fast);
      &:hover { box-shadow: var(--shadow-sm); }
    }

    .order-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-4);
    }

    .order-card__id-group { display: flex; align-items: center; gap: var(--space-2); }
    .order-card__label { font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); font-weight: var(--weight-semibold); margin-bottom: var(--space-1); display: block; }
    .order-card__id { font-size: var(--text-sm); font-weight: var(--weight-bold); font-family: monospace; }
    .order-card__date { font-size: var(--text-sm); color: var(--color-text-secondary); }

    .order-card__body {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-5);
    }

    .order-card__badges { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: 4px; }
    .order-card__total { font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--color-text); }
    .order-card__items-count { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-secondary); margin-top: 2px; }

    .order-card__footer {
      display: flex;
      justify-content: flex-end;
    }

    .order-card__btn {
      display: inline-block;
      padding: var(--space-2) var(--space-5);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text);
      text-decoration: none;
      transition: all var(--transition-fast);
      &:hover { background: var(--color-accent); color: white; border-color: var(--color-accent); }
    }

    .order-card-skeleton {
      height: 180px;
      background: linear-gradient(90deg, var(--color-surface-alt) 25%, var(--color-border) 50%, var(--color-surface-alt) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-lg);
    }

    .orders-empty {
      text-align: center;
      padding: var(--space-16) var(--space-8);
      background: var(--color-surface-alt);
      border-radius: var(--radius-lg);
      border: 1px dashed var(--color-border);
    }
    .orders-empty__icon { font-size: 4rem; margin-bottom: var(--space-4); }
    .orders-empty__title { font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-2); }
    .orders-empty__desc { color: var(--color-text-tertiary); margin-bottom: var(--space-6); max-width: 400px; margin-inline: auto; }
    .orders-empty__btn {
      display: inline-block;
      padding: var(--space-3) var(--space-8);
      background: var(--color-accent);
      color: white;
      text-decoration: none;
      border-radius: var(--radius-md);
      font-weight: var(--weight-semibold);
      font-size: var(--text-sm);
      &:hover { background: var(--color-accent-hover); }
    }

    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 600px) {
      .order-card__body { grid-template-columns: 1fr; gap: var(--space-4); }
      .order-card__header { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
    }
  `],
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (res) => {
        // Backend currently only returns orders for the current user unless modified.
        this.orders.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
