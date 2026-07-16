import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center min-h-[50vh] p-4">
      <div class="text-center p-8 bg-surface border border-border/50 rounded-xl max-w-md w-full shadow-lg">
        @if (verifying()) {
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <h2 class="text-xl font-medium mb-2 text-foreground">Verifying Payment...</h2>
          <p class="text-muted-foreground">Please wait while we confirm your payment with Stripe.</p>
        } @else {
          <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 class="text-xl font-medium mb-2 text-foreground">Payment Verification Failed</h2>
          <p class="text-muted-foreground mb-6">We couldn't verify your payment. Please contact support if you were charged.</p>
          <button (click)="goHome()" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">Return to Shop</button>
        }
      </div>
    </div>
  `
})
export class CheckoutSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);

  protected readonly verifying = signal(true);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      const orderId = params['order_id'];

      if (!sessionId || !orderId) {
        this.verifying.set(false);
        this.toast.error('Invalid payment callback parameters.');
        return;
      }

      this.orderService.verifyPayment(orderId, sessionId).subscribe({
        next: () => {
          this.toast.success('Payment successful! Your order has been placed.');
          this.router.navigate(['/orders', orderId]);
        },
        error: (err) => {
          this.verifying.set(false);
          this.toast.error(err?.error?.msg || 'Payment verification failed.');
        }
      });
    });
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
