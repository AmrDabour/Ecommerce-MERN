import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Order } from '../../../core/models/order.model';
import { User } from '../../../core/models/user.model';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, CurrencyFormatPipe, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Orders Management</h1>
          <p class="admin-desc">View and manage all customer orders.</p>
        </div>
      </div>

      <div class="table-card">
        @if (loading()) {
          <div class="table-loading">Loading orders…</div>
        } @else {
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order._id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/orders', order._id]" class="order-id-link">
                        #{{ order._id.slice(0, 8) }}
                      </a>
                    </td>
                    <td>
                      <div class="customer-info">
                        <span class="customer-name">{{ getUserName(order.user) }}</span>
                      </div>
                    </td>
                    <td>{{ formatDate(order.createdAt) }}</td>
                    <td class="order-total">{{ order.totalPrice | currencyFormat }}</td>
                    <td>
                      @if (order.isPaid) {
                        <app-badge variant="success" pill>Paid</app-badge>
                      } @else {
                        <app-badge variant="warning" pill>Unpaid</app-badge>
                      }
                    </td>
                    <td>
                      @if (order.isDelivered) {
                        <app-badge variant="success" pill>Delivered</app-badge>
                      } @else {
                        <app-badge variant="info" pill>In Transit</app-badge>
                      }
                    </td>
                    <td>
                      <div class="action-cell">
                        <button class="action-btn action-btn--edit" title="Mark as Paid"
                          [disabled]="order.isPaid || actingId() === order._id"
                          (click)="markPaid(order._id)">
                          💰
                        </button>
                        <button class="action-btn action-btn--edit" title="Mark as Delivered"
                          [disabled]="order.isDelivered || actingId() === order._id"
                          (click)="markDelivered(order._id)">
                          🚚
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-page { display: flex; flex-direction: column; gap: var(--space-6); }
    .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-4); }
    .admin-title { font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--color-text); }
    .admin-desc { font-size: var(--text-sm); color: var(--color-text-tertiary); margin-top: var(--space-1); }

    .table-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: var(--space-4) var(--space-6); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; font-weight: var(--weight-bold); color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border); background: var(--color-surface-alt); }
    .admin-table td { padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); vertical-align: middle; color: var(--color-text); }
    .admin-table tbody tr:last-child td { border-bottom: none; }
    .admin-table tbody tr:hover { background: var(--color-surface-alt); }

    .table-loading { padding: var(--space-10); text-align: center; color: var(--color-text-tertiary); font-size: var(--text-sm); }

    .order-id-link { font-family: monospace; font-weight: var(--weight-bold); color: var(--color-accent); text-decoration: none; &:hover { text-decoration: underline; } }
    .customer-name { font-weight: var(--weight-medium); }
    .order-total { font-weight: var(--weight-semibold); }

    .action-cell { display: flex; gap: var(--space-2); }
    .action-btn { width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: var(--color-surface); cursor: pointer; transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid var(--color-border); }
    .action-btn:hover:not(:disabled) { background: var(--color-surface-alt); }
    .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly actingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading.set(true);
    // Real app would fetch ALL orders for admin instead of just user's.
    // The backend `getOrders` is currently user-filtered unless admin hits a special endpoint.
    // Assuming backend returns all for admin via same endpoint if role=admin.
    this.orderService.getOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected getUserName(user: string | User): string {
    if (typeof user === 'string') return 'User';
    return user.name ?? 'User';
  }

  protected formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US');
  }

  protected markPaid(id: string): void {
    this.actingId.set(id);
    this.orderService.markAsPaid(id).subscribe({
      next: () => {
        this.toast.success('Order marked as paid.');
        this.actingId.set(null);
        this.loadOrders();
      },
      error: () => {
        this.toast.error('Failed to update order.');
        this.actingId.set(null);
      }
    });
  }

  protected markDelivered(id: string): void {
    this.actingId.set(id);
    this.orderService.markAsDelivered(id).subscribe({
      next: () => {
        this.toast.success('Order marked as delivered.');
        this.actingId.set(null);
        this.loadOrders();
      },
      error: () => {
        this.toast.error('Failed to update order.');
        this.actingId.set(null);
      }
    });
  }
}
