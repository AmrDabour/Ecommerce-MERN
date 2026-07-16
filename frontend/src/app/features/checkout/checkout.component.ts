import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    zip: [''],
    paymentMethod: ['cash' as 'cash' | 'card', Validators.required],
  });

  protected get f() { return this.form.controls; }

  ngOnInit(): void {
    // Pre-fill from user profile if available
    const user = this.auth.currentUser();
    if (user?.address) {
      this.form.patchValue({
        street: user.address.street,
        city: user.address.city,
        zip: user.address.zip,
      });
    }

    // Fetch cart
    this.cartService.fetchCart().subscribe();
  }

  protected getSubtotal(): number {
    return this.cartService.cart()?.cartItems.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  }

  protected getItemName(item: { product: unknown }): string {
    if (!item.product) return 'Product';
    if (typeof item.product === 'object' && item.product !== null) {
      return (item.product as { name: string }).name ?? 'Product';
    }
    return 'Product';
  }

  protected placeOrder(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const { street, city, zip, paymentMethod } = this.form.value;
    this.orderService.createOrder({
      paymentMethod: paymentMethod as 'cash' | 'card',
      shippingAddress: { street: street!, city: city!, zip: zip ?? '' },
    }).subscribe({
      next: (res) => {
        this.cartService.clearCartSignal();
        this.toast.success('Order placed successfully!');
        this.router.navigate(['/orders', res.data._id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err?.error?.msg ?? 'Could not place order. Please try again.');
      },
    });
  }
}
