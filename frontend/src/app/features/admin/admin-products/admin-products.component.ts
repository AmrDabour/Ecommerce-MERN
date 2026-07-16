import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Products Management</h1>
          <p class="admin-desc">Add, edit, or remove products from your catalog.</p>
        </div>
        <button class="btn btn--primary" (click)="openModal()">+ Add Product</button>
      </div>

      <!-- Table -->
      <div class="table-card">
        @if (loading()) {
          <div class="table-loading">Loading products…</div>
        } @else {
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (product of products(); track product._id) {
                  <tr>
                    <td>
                      <div class="product-cell">
                        @if (product.imageCover) {
                          <img [src]="product.imageCover" alt="" class="product-img" />
                        } @else {
                          <div class="product-img-placeholder">📦</div>
                        }
                        <div class="product-info">
                          <span class="product-name">{{ product.name }}</span>
                          <span class="product-id">ID: {{ product._id.slice(0, 8) }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ getCategoryName(product) }}</td>
                    <td>
                      <div class="price-cell">
                        @if (product.priceAfterDiscount && product.priceAfterDiscount < product.price) {
                          <span class="price-sale">{{ product.priceAfterDiscount | currencyFormat }}</span>
                          <span class="price-old">{{ product.price | currencyFormat }}</span>
                        } @else {
                          <span>{{ product.price | currencyFormat }}</span>
                        }
                      </div>
                    </td>
                    <td>
                      <span class="stock-badge" [class.stock-badge--out]="product.quantity === 0">
                        {{ product.quantity }} in stock
                      </span>
                    </td>
                    <td>
                      <div class="action-cell">
                        <button class="action-btn action-btn--edit" (click)="openModal(product)">✏️</button>
                        <button class="action-btn action-btn--delete" (click)="deleteProduct(product._id)">🗑</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Modal Overlay -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">{{ editingId() ? 'Edit Product' : 'Add New Product' }}</h2>
              <button class="modal-close" (click)="closeModal()">✕</button>
            </div>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-group">
                <label class="form-label" for="name">Product Name</label>
                <input id="name" type="text" class="form-input" formControlName="name" />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="description">Description</label>
                <textarea id="description" class="form-input" formControlName="description" rows="3"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="price">Price ($)</label>
                  <input id="price" type="number" class="form-input" formControlName="price" min="0" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="priceAfterDiscount">Sale Price ($)</label>
                  <input id="priceAfterDiscount" type="number" class="form-input" formControlName="priceAfterDiscount" min="0" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="quantity">Quantity in Stock</label>
                  <input id="quantity" type="number" class="form-input" formControlName="quantity" min="0" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="category">Category</label>
                  <select id="category" class="form-input" formControlName="category">
                    <option value="">Select a category</option>
                    @for (cat of categories(); track cat._id) {
                      <option [value]="cat._id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="imageCover">Image URL</label>
                <input id="imageCover" type="text" class="form-input" formControlName="imageCover" placeholder="https://example.com/image.jpg" />
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn--outline" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving()">
                  {{ saving() ? 'Saving…' : 'Save Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-page { display: flex; flex-direction: column; gap: var(--space-6); }
    .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-4); }
    .admin-title { font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--color-text); }
    .admin-desc { font-size: var(--text-sm); color: var(--color-text-tertiary); margin-top: var(--space-1); }

    .btn { padding: var(--space-2) var(--space-5); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: var(--weight-semibold); cursor: pointer; font-family: inherit; transition: all var(--transition-fast); }
    .btn--primary { background: var(--color-accent); color: white; border: none; &:hover:not(:disabled) { background: var(--color-accent-hover); } &:disabled { opacity: 0.6; cursor: not-allowed; } }
    .btn--outline { background: transparent; border: 1.5px solid var(--color-border); color: var(--color-text); &:hover { background: var(--color-surface-alt); } }

    .table-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: var(--space-4) var(--space-6); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; font-weight: var(--weight-bold); color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border); background: var(--color-surface-alt); }
    .admin-table td { padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); vertical-align: middle; color: var(--color-text); }
    .admin-table tbody tr:last-child td { border-bottom: none; }
    .admin-table tbody tr:hover { background: var(--color-surface-alt); }

    .table-loading { padding: var(--space-10); text-align: center; color: var(--color-text-tertiary); font-size: var(--text-sm); }

    .product-cell { display: flex; align-items: center; gap: var(--space-4); }
    .product-img { width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover; }
    .product-img-placeholder { width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--color-surface-alt); display: flex; align-items: center; justify-content: center; font-size: 1rem; border: 1px solid var(--color-border); }
    .product-info { display: flex; flex-direction: column; }
    .product-name { font-weight: var(--weight-semibold); color: var(--color-text); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .product-id { font-size: var(--text-xs); color: var(--color-text-tertiary); font-family: monospace; }

    .price-cell { display: flex; flex-direction: column; }
    .price-sale { color: var(--color-error); font-weight: var(--weight-bold); }
    .price-old { font-size: var(--text-xs); color: var(--color-text-tertiary); text-decoration: line-through; }

    .stock-badge { display: inline-block; padding: 2px 8px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-semibold); background: var(--color-success-light); color: var(--color-success); }
    .stock-badge--out { background: var(--color-error-light); color: var(--color-error); }

    .action-cell { display: flex; gap: var(--space-2); }
    .action-btn { width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: var(--color-surface); cursor: pointer; transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid var(--color-border); }
    .action-btn:hover { background: var(--color-surface-alt); }
    .action-btn--delete:hover { background: var(--color-error-light); color: var(--color-error); border-color: var(--color-error); }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); backdrop-filter: blur(4px); }
    .modal-content { background: var(--color-surface); border-radius: var(--radius-xl); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl); border: 1px solid var(--color-border); }
    
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--color-border); }
    .modal-title { font-size: var(--text-lg); font-weight: var(--weight-bold); }
    .modal-close { background: none; border: none; font-size: var(--text-xl); color: var(--color-text-tertiary); cursor: pointer; &:hover { color: var(--color-text); } }

    .modal-form { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); }
    .form-input { padding: var(--space-3); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-family: inherit; background: var(--color-surface); color: var(--color-text); outline: none; &:focus { border-color: var(--color-accent); } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

    .modal-footer { display: flex; justify-content: flex-end; gap: var(--space-3); padding-top: var(--space-6); margin-top: var(--space-2); border-top: 1px solid var(--color-border); }
  `]
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);

  protected readonly showModal = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    priceAfterDiscount: [null as number | null],
    quantity: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    imageCover: ['']
  });

  ngOnInit(): void {
    this.loadProducts();
    this.categoryService.getCategories().subscribe(res => this.categories.set(res.data));
  }

  private loadProducts(): void {
    this.loading.set(true);
    // Fetch all for admin table (in real app, pagination is needed)
    this.productService.getProducts({ limit: 100 } as any).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected getCategoryName(product: Product): string {
    if (typeof product.category === 'string') return 'Unknown';
    return (product.category as Category).name ?? 'Unknown';
  }

  protected openModal(product?: Product): void {
    if (product) {
      this.editingId.set(product._id);
      this.form.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        priceAfterDiscount: product.priceAfterDiscount || null,
        quantity: product.quantity,
        category: typeof product.category === 'string' ? product.category : product.category._id,
        imageCover: product.imageCover || ''
      });
    } else {
      this.editingId.set(null);
      this.form.reset({ price: 0, quantity: 0, category: '' });
    }
    this.showModal.set(true);
  }

  protected closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.value;
    
    // Cleanup empty discount
    if (data.priceAfterDiscount === null) delete data.priceAfterDiscount;

    const req$ = this.editingId()
      ? this.productService.updateProduct(this.editingId()!, data as any)
      : this.productService.createProduct(data as any);

    req$.subscribe({
      next: () => {
        this.toast.success(`Product ${this.editingId() ? 'updated' : 'created'} successfully!`);
        this.saving.set(false);
        this.closeModal();
        this.loadProducts();
      },
      error: (err) => {
        this.toast.error(err?.error?.msg || 'An error occurred.');
        this.saving.set(false);
      }
    });
  }

  protected deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success('Product deleted.');
        this.loadProducts();
      },
      error: () => this.toast.error('Could not delete product.')
    });
  }
}
