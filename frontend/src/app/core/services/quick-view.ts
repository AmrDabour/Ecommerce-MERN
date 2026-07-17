import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class QuickViewService {
  public selectedProduct = signal<Product | null>(null);

  public open(product: Product): void {
    this.selectedProduct.set(product);
  }

  public close(): void {
    this.selectedProduct.set(null);
  }
}
