import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { ToastService } from '../../shared/ui/toast/toast.service';

const COMPARE_KEY = 'ecommerce_compare_items';
const MAX_COMPARE_ITEMS = 4;

@Injectable({
  providedIn: 'root'
})
export class CompareService {
  private readonly toast = inject(ToastService);
  private readonly _compareItems = signal<Product[]>([]);

  readonly compareItems = this._compareItems.asReadonly();
  readonly compareCount = computed(() => this._compareItems().length);

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(COMPARE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this._compareItems.set(parsed);
        }
      } catch {
        localStorage.removeItem(COMPARE_KEY);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(this._compareItems()));
  }

  isInCompare(productId: string): boolean {
    return this._compareItems().some(item => item._id === productId);
  }

  addToCompare(product: Product): void {
    const current = this._compareItems();
    if (current.some(item => item._id === product._id)) {
      this.toast.info('Product is already in the comparison list');
      return;
    }
    if (current.length >= MAX_COMPARE_ITEMS) {
      this.toast.warning(`You can only compare up to ${MAX_COMPARE_ITEMS} products at a time.`);
      return;
    }
    
    this._compareItems.update(items => [...items, product]);
    this.saveToStorage();
    this.toast.success(`${product.name} added to comparison list`);
  }

  removeFromCompare(productId: string): void {
    this._compareItems.update(items => items.filter(item => item._id !== productId));
    this.saveToStorage();
    this.toast.success('Product removed from comparison');
  }

  clearCompare(): void {
    this._compareItems.set([]);
    localStorage.removeItem(COMPARE_KEY);
    this.toast.success('Comparison list cleared');
  }
}
