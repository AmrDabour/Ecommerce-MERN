import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'luxe_recently_viewed';
const MAX_ITEMS = 8;

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {
  private readonly products = signal<Product[]>(this.loadFromStorage());

  readonly recentlyViewed = this.products.asReadonly();

  addProduct(product: Product): void {
    const current = this.products();
    // Remove if already exists
    const filtered = current.filter(p => p._id !== product._id);
    
    // Add to beginning
    const updated = [product, ...filtered].slice(0, MAX_ITEMS);
    
    this.products.set(updated);
    this.saveToStorage(updated);
  }

  private loadFromStorage(): Product[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }
}
