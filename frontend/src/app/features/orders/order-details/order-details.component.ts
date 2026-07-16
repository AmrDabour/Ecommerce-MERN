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
  template: `
    <div class="order-detail-page">
      <div class="container">
        <a routerLink="/orders" class="back-link">← My Orders</a>

        @if (loading()) {
          <div style="margin-top:32px;">
            <app-skeleton height="32px" width="40%" />
            <app-skeleton height="200px" style="margin-top:24px;" />
          </div>
        } @else if (order()) {
          <div class="order-detail-header">
            <div>
              <h1 class="order-detail__id">Order #{{ order()!._id.slice(0,8) }}</h1>
              <p class="order-detail__date">Placed on {{ formatDate(order()!.createdAt) }}</p>
            </div>
            <div class="order-detail__status-group">
              @if (order()!.isPaid) {
                <app-badge variant="success" pill>✓ Paid</app-badge>
              } @else {
                <app-badge variant="warning" pill>Awaiting Payment</app-badge>
              }
              @if (order()!.isDelivered) {
                <app-badge variant="success" pill>✓ Delivered</app-badge>
              } @else {
                <app-badge variant="info" pill>In Transit</app-badge>
              }
            </div>
          </div>

          <div class="order-detail-layout">
            <!-- Items -->
            <div class="order-items-section">
              <h2 class="section-title">Items Ordered</h2>
              <div class="order-items-list">
                @for (item of order()!.orderItems; track $index) {
                  <div class="order-item-row">
                    <div class="order-item-row__info">
                      <span class="order-item-row__name">{{ getItemName(item) }}</span>
                      <span class="order-item-row__qty">Qty: {{ item.quantity }}</span>
                    </div>
                    <span class="order-item-row__price">{{ (item.price * item.quantity) | currencyFormat }}</span>
                  </div>
                }
              </div>
              <div class="order-total-row">
                <span>Order Total</span>
                <span class="order-total-amount">{{ order()!.totalPrice | currencyFormat }}</span>
              </div>
            </div>

            <!-- Details Sidebar -->
            <div class="order-sidebar">
              <div class="sidebar-card">
                <h3 class="sidebar-card__title">Shipping Address</h3>
                <p class="sidebar-card__text">
                  {{ order()!.shippingAddress.street }}<br />
                  {{ order()!.shippingAddress.city }}, {{ order()!.shippingAddress.zip }}
                </p>
              </div>

              <div class="sidebar-card">
                <h3 class="sidebar-card__title">Payment</h3>
                <p class="sidebar-card__text" style="text-transform: capitalize;">
                  {{ order()!.paymentMethod }}
                  @if (order()!.paidAt) { <br /><span class="text-xs text-tertiary">Paid {{ formatDate(order()!.paidAt) }}</span> }
                </p>
              </div>

              <!-- Admin Actions -->
              @if (authService.isAdmin()) {
                <div class="sidebar-card">
                  <h3 class="sidebar-card__title">Admin Actions</h3>
                  @if (!order()!.isPaid) {
                    <button class="admin-action-btn" [disabled]="acting()" (click)="markPaid()">
                      @if (acting() === 'paid') { … } @else { Mark as Paid }
                    </button>
                  }
                  @if (!order()!.isDelivered) {
                    <button class="admin-action-btn admin-action-btn--secondary" [disabled]="acting()" (click)="markDelivered()">
                      @if (acting() === 'delivered') { … } @else { Mark as Delivered }
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        } @else {
          <div style="text-align:center;padding:80px 0;">
            <h2>Order not found</h2>
            <a routerLink="/orders">Back to Orders</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .order-detail-page { padding-top: calc(var(--header-height) + var(--space-6)); padding-bottom: var(--space-16); min-height: 100vh; }
    .back-link { display: inline-block; color: var(--color-accent); text-decoration: none; font-size: var(--text-sm); margin-bottom: var(--space-6); &:hover { text-decoration: underline; } }

    .order-detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); flex-wrap: wrap; margin-bottom: var(--space-8); }
    .order-detail__id { font-size: var(--text-2xl); font-weight: var(--weight-extrabold); font-family: monospace; }
    .order-detail__date { font-size: var(--text-sm); color: var(--color-text-tertiary); margin-top: var(--space-1); }
    .order-detail__status-group { display: flex; gap: var(--space-2); flex-wrap: wrap; }

    .order-detail-layout { display: grid; grid-template-columns: 1fr 320px; gap: var(--space-8); align-items: start; }

    .section-title { font-size: var(--text-lg); font-weight: var(--weight-semibold); margin-bottom: var(--space-4); }
    .order-items-list { display: flex; flex-direction: column; gap: var(--space-3); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); }
    .order-item-row { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); font-size: var(--text-sm); }
    .order-item-row__name { font-weight: var(--weight-medium); }
    .order-item-row__qty { color: var(--color-text-tertiary); font-size: var(--text-xs); margin-top: 2px; }
    .order-item-row__price { font-weight: var(--weight-semibold); flex-shrink: 0; }
    .order-total-row { display: flex; justify-content: space-between; font-weight: var(--weight-bold); font-size: var(--text-base); padding-top: var(--space-4); margin-top: var(--space-4); border-top: 1px solid var(--color-border); }
    .order-total-amount { color: var(--color-text); }

    .sidebar-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-4); }
    .sidebar-card__title { font-size: var(--text-sm); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-tertiary); margin-bottom: var(--space-3); }
    .sidebar-card__text { font-size: var(--text-sm); color: var(--color-text); line-height: var(--leading-relaxed); }
    .text-xs { font-size: var(--text-xs); }
    .text-tertiary { color: var(--color-text-tertiary); }

    .admin-action-btn { display: block; width: 100%; padding: var(--space-3); background: var(--color-accent); color: white; border: none; border-radius: var(--radius-sm); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; margin-bottom: var(--space-2); transition: background var(--transition-fast); &:hover:not(:disabled) { background: var(--color-accent-hover); } &:disabled { opacity: 0.5; cursor: wait; } }
    .admin-action-btn--secondary { background: var(--color-info); &:hover:not(:disabled) { background: #1d4ed8; } }

    @media (max-width: 767px) { .order-detail-layout { grid-template-columns: 1fr; } }
  `],
})
export class OrderDetailsComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  protected readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  protected readonly order = signal<Order | null>(null);
  protected readonly loading = signal(true);
  protected readonly acting = signal<'paid' | 'delivered' | null>(null);

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

  protected markDelivered(): void {
    this.acting.set('delivered');
    this.orderService.markAsDelivered(this.order()!._id).subscribe({
      next: (r) => { this.order.set(r.data); this.acting.set(null); this.toast.success('Order marked as delivered.'); },
      error: () => this.acting.set(null),
    });
  }
}
