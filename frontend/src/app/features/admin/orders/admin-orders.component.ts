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
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
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
