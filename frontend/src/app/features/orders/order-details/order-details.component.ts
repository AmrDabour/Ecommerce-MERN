import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models/order.model';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [RouterLink, CurrencyFormatPipe, SkeletonComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  protected readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  protected readonly order = signal<Order | null>(null);
  protected readonly loading = signal(true);
  protected readonly acting = signal<'paid' | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrder(id).subscribe({
      next: (r) => { this.order.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected getItemName(item: any): string {
    if (typeof item.product === 'string') return 'Product';
    return item.product?.name ?? 'Product';
  }

  protected formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  protected markPaid(): void {
    this.acting.set('paid');
    this.orderService.markAsPaid(this.order()!._id).subscribe({
      next: (r) => { this.order.set(r.data); this.acting.set(null); this.toast.success('Order marked as paid.'); },
      error: () => this.acting.set(null),
    });
  }
}
