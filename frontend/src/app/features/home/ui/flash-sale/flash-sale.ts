import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { ProductCardSkeleton } from '../../../../shared/components/product-card-skeleton/product-card-skeleton';
import { FadeInDirective } from '../../../../shared/directives/fade-in.directive';

@Component({
  selector: 'app-flash-sale',
  standalone: true,
  imports: [ProductCard, ProductCardSkeleton, FadeInDirective],
  templateUrl: './flash-sale.html',
  styleUrl: './flash-sale.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashSaleComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);

  public readonly flashProducts = signal<Product[]>([]);
  public readonly loading = signal(true);

  public hours = signal('00');
  public minutes = signal('00');
  public seconds = signal('00');
  
  private timer: any;

  ngOnInit(): void {
    this.fetchFlashProducts();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private fetchFlashProducts(): void {
    // Fetch a batch of products and filter those with a discount
    this.productService.getProducts({ limit: 40, sort: '-createdAt' }).subscribe({
      next: (res) => {
        const discounted = res.data
          .filter(p => p.priceAfterDiscount && p.priceAfterDiscount < p.price)
          .slice(0, 4);
        
        this.flashProducts.set(discounted);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private startCountdown(): void {
    // Simulate a countdown ending at midnight tonight
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        this.hours.set('00');
        this.minutes.set('00');
        this.seconds.set('00');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      this.hours.set(h.toString().padStart(2, '0'));
      this.minutes.set(m.toString().padStart(2, '0'));
      this.seconds.set(s.toString().padStart(2, '0'));
    };

    updateTimer();
    this.timer = setInterval(updateTimer, 1000);
  }
}
