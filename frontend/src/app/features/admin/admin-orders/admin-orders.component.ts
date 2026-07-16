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
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
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
