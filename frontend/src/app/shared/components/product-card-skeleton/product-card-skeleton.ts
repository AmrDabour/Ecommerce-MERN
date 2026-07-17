import { Component } from '@angular/core';
import { Skeleton } from '../skeleton/skeleton';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [Skeleton],
  template: `
    <div class="product-card-skeleton">
      <app-skeleton height="200px" borderRadius="16px" marginBottom="16px"></app-skeleton>
      <app-skeleton width="80%" height="24px" marginBottom="8px"></app-skeleton>
      <app-skeleton width="60%" height="20px" marginBottom="16px"></app-skeleton>
      <div class="skeleton-footer">
        <app-skeleton width="30%" height="28px"></app-skeleton>
        <app-skeleton width="32px" height="32px" borderRadius="50%"></app-skeleton>
      </div>
    </div>
  `,
  styleUrls: ['./product-card-skeleton.scss']
})
export class ProductCardSkeleton {}
