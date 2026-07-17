import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal, effect, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../ui/toast/toast.service';
import { ImageZoomDirective } from '../../directives/image-zoom';

@Component({
  selector: 'app-quick-view',
  standalone: true,
  imports: [RouterLink, ImageZoomDirective],
  templateUrl: './quick-view.html',
  styleUrl: './quick-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickView {
  public product = input<Product | null>(null);
  
  @Output() close = new EventEmitter<void>();

  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  public activeImage = signal<string>('');
  public qty = signal(1);
  public selectedColor = signal<string | null>(null);
  public selectedSize = signal<string | null>(null);
  public adding = signal(false);

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        this.activeImage.set(p.imageCover || (p.images?.[0] ?? ''));
        this.qty.set(1);
        this.selectedColor.set(null);
        this.selectedSize.set(null);
        this.adding.set(false);
      }
    }, { allowSignalWrites: true });
  }

  public getStars(avg?: number): string {
    const n = Math.round(avg ?? 0);
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  public getDiscountPct(): number {
    const p = this.product();
    if (!p || !p.priceAfterDiscount) return 0;
    return Math.round((1 - p.priceAfterDiscount / p.price) * 100);
  }

  public increaseQty(): void {
    const p = this.product();
    const max = p?.quantity ?? 1;
    if (this.qty() < max) this.qty.update((q) => q + 1);
  }

  public decreaseQty(): void {
    if (this.qty() > 1) this.qty.update((q) => q - 1);
  }

  public addToCart(): void {
    const p = this.product();
    if (!p) return;

    if (p.colors?.length && !this.selectedColor()) {
      this.toast.error('Please select a color first.');
      return;
    }
    if (p.sizes?.length && !this.selectedSize()) {
      this.toast.error('Please select a size first.');
      return;
    }

    this.adding.set(true);
    const c = this.selectedColor() ?? undefined;
    const s = this.selectedSize() ?? undefined;

    if (this.authService.isAuthenticated()) {
      this.cartService.addToCart(p._id, c, s).subscribe({
        next: () => {
          this.adding.set(false);
          this.toast.success('Added to cart!');
          this.close.emit();
        },
        error: () => {
          this.adding.set(false);
          this.toast.error('Could not add to cart.');
        },
      });
    } else {
      for (let i = 0; i < this.qty(); i++) {
        this.cartService.addToGuestCart(p._id, c, s);
      }
      this.adding.set(false);
      this.toast.success('Added to cart!');
      this.close.emit();
    }
  }
}
