import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Order } from '../../../core/models/order.model';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [RouterLink, CurrencyFormatPipe, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-panel">
      <h1 class="page-title">Orders</h1>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Delivered</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order._id) {
              <tr>
                <td class="mono">{{ order._id.slice(0,8) }}…</td>
                <td class="capitalize">{{ order.paymentMethod }}</td>
                <td class="font-semibold">{{ order.totalPrice | currencyFormat }}</td>
                <td>
                  @if (order.isPaid) {
                    <app-badge variant="success">✓ Paid</app-badge>
                  } @else {
                    <app-badge variant="warning">Pending</app-badge>
                  }
                </td>
                <td>
                  @if (order.isDelivered) {
                    <app-badge variant="success">Delivered</app-badge>
                  } @else {
                    <app-badge variant="info">Transit</app-badge>
                  }
                </td>
                <td class="text-muted">{{ formatDate(order.createdAt) }}</td>
                <td>
                  <div class="action-btns">
                    <a [routerLink]="['/orders', order._id]" class="action-btn action-btn--view">View</a>
                    @if (!order.isPaid) {
                      <button class="action-btn action-btn--pay" (click)="markPaid(order)">Pay</button>
                    }
                    @if (!order.isDelivered) {
                      <button class="action-btn action-btn--deliver" (click)="markDelivered(order)">Deliver</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-6); }
    .data-table-wrapper { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: auto; }
    .data-table { width: 100%; border-collapse: collapse; min-width: 800px; }
    .data-table th { padding: var(--space-3) var(--space-4); text-align: left; font-size: var(--text-xs); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-tertiary); background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); }
    .data-table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--color-surface-alt); }
    .mono { font-family: monospace; }
    .capitalize { text-transform: capitalize; }
    .font-semibold { font-weight: var(--weight-semibold); }
    .text-muted { color: var(--color-text-tertiary); }
    .action-btns { display: flex; gap: var(--space-1); flex-wrap: wrap; }
    .action-btn { padding: 2px var(--space-2); border-radius: var(--radius-xs); font-family: inherit; font-size: 11px; font-weight: var(--weight-semibold); cursor: pointer; border: 1.5px solid; text-decoration: none; display: inline-flex; align-items: center; transition: all var(--transition-fast); }
    .action-btn--view { border-color: var(--color-border); color: var(--color-text); background: none; &:hover { border-color: var(--color-accent); color: var(--color-accent); } }
    .action-btn--pay { border-color: var(--color-success); color: var(--color-success); background: none; &:hover { background: var(--color-success-light); } }
    .action-btn--deliver { border-color: var(--color-info); color: var(--color-info); background: none; &:hover { background: var(--color-info-light); } }
  `],
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  protected readonly orders = signal<Order[]>([]);

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({ next: (r) => this.orders.set(r.data) });
  }

  protected formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected markPaid(order: Order): void {
    this.orderService.markAsPaid(order._id).subscribe({
      next: (r) => { this.orders.update((l) => l.map((o) => o._id === r.data._id ? r.data : o)); this.toast.success('Marked as paid.'); },
    });
  }

  protected markDelivered(order: Order): void {
    this.orderService.markAsDelivered(order._id).subscribe({
      next: (r) => { this.orders.update((l) => l.map((o) => o._id === r.data._id ? r.data : o)); this.toast.success('Marked as delivered.'); },
    });
  }
}
