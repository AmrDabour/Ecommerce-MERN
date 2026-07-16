import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CartDrawerService } from './cart-drawer.service';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { QuantityStepperComponent } from '../quantity-stepper/quantity-stepper.component';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyFormatPipe, QuantityStepperComponent],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('drawerAnimation', [
      state('open', style({ transform: 'translateX(0)' })),
      state('closed', style({ transform: 'translateX(100%)' })),
      transition('open <=> closed', [
        animate('0.4s cubic-bezier(0.34, 1.56, 0.64, 1)')
      ])
    ]),
    trigger('backdropAnimation', [
      state('open', style({ opacity: 1 })),
      state('closed', style({ opacity: 0 })),
      transition('open <=> closed', [
        animate('0.3s ease')
      ])
    ])
  ]
})
export class CartDrawer {
  public readonly drawerService = inject(CartDrawerService);
  public readonly cartService = inject(CartService);

  protected readonly cart = this.cartService.cart;
  protected readonly isEmpty = computed(() => !this.cart() || this.cart()?.cartItems.length === 0);

  protected updateQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity).subscribe();
  }

  protected removeItem(productId: string) {
    this.cartService.removeFromCart(productId).subscribe();
  }
}
