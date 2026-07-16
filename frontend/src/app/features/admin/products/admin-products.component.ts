import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyFormatPipe, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h1>Products Management</h1>
        <button class="add-btn" (click)="openCreate()">+ Add Product</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
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
            @if (loading()) {
              @for (i of skeletons; track i) {
                <tr><td colspan="5" class="skeleton-row"></td></tr>
              }
            }
            @for (product of products(); track product._id) {
              <tr>
                <td>
                  <div class="product-cell">
                    @if (product.imageCover) {
                      <img [src]="product.imageCover" [alt]="product.name" class="product-cell__img" />
                    }
                    <span class="product-cell__name">{{ product.name }}</span>
                  </div>
                </td>
                <td class="text-sm text-muted">{{ getCategoryName(product) }}</td>
                <td class="text-sm font-semibold">{{ product.price | currencyFormat }}</td>
                <td class="text-sm">{{ product.quantity }}</td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn action-btn--edit" (click)="openEdit(product)">Edit</button>
                    <button class="action-btn action-btn--delete" (click)="confirmDelete(product)">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <app-modal [isOpen]="modalOpen()" [title]="editingId() ? 'Edit Product' : 'Add Product'" (close)="closeModal()">
      <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
        <div class="modal-fields">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" class="form-input" formControlName="name" />
          </div>
          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea class="form-input" formControlName="description" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Price *</label>
              <input type="number" class="form-input" formControlName="price" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label class="form-label">Discount Price</label>
              <input type="number" class="form-input" formControlName="priceAfterDiscount" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Quantity *</label>
              <input type="number" class="form-input" formControlName="quantity" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select class="form-input" formControlName="category">
                <option value="">Select category</option>
                @for (cat of categories(); track cat._id) {
                  <option [value]="cat._id">{{ cat.name }}</option>
                }
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Image Cover URL</label>
            <input type="url" class="form-input" formControlName="imageCover" />
          </div>
        </div>
      </form>
      <div modal-footer>
        <button class="cancel-btn" (click)="closeModal()">Cancel</button>
        <button class="save-btn" [disabled]="productForm.invalid || saving()" (click)="saveProduct()">
          @if (saving()) { Saving… } @else { Save }
        </button>
      </div>
    </app-modal>

    <!-- Delete Confirm Modal -->
    <app-modal [isOpen]="deleteModalOpen()" title="Delete Product" size="sm" (close)="deleteModalOpen.set(false)">
      <p>Are you sure you want to delete <strong>{{ deletingProduct()?.name }}</strong>? This cannot be undone.</p>
      <div modal-footer>
        <button class="cancel-btn" (click)="deleteModalOpen.set(false)">Cancel</button>
        <button class="delete-btn" [disabled]="deleting()" (click)="deleteProduct()">
          @if (deleting()) { Deleting… } @else { Delete }
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .admin-panel__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); }
    .admin-panel__header h1 { font-size: var(--text-2xl); font-weight: var(--weight-bold); }
    .add-btn { padding: var(--space-2) var(--space-5); background: var(--color-accent); color: white; border: none; border-radius: var(--radius-md); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; font-size: var(--text-sm); transition: background var(--transition-fast); &:hover { background: var(--color-accent-hover); } }

    .data-table-wrapper { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: var(--space-4); text-align: left; font-size: var(--text-xs); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-tertiary); background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); }
    .data-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--color-surface-alt); }

    .product-cell { display: flex; align-items: center; gap: var(--space-3); }
    .product-cell__img { width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-xs); }
    .product-cell__name { font-weight: var(--weight-medium); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .text-sm { font-size: var(--text-sm); }
    .text-muted { color: var(--color-text-tertiary); }
    .font-semibold { font-weight: var(--weight-semibold); }
    .skeleton-row { height: 56px; background: linear-gradient(90deg, var(--color-surface-alt) 25%, #f0f0f0 50%, var(--color-surface-alt) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; }

    .action-btns { display: flex; gap: var(--space-2); }
    .action-btn { padding: var(--space-1) var(--space-3); border-radius: var(--radius-xs); font-family: inherit; font-size: var(--text-xs); font-weight: var(--weight-semibold); cursor: pointer; border: 1.5px solid; transition: all var(--transition-fast); }
    .action-btn--edit { border-color: var(--color-accent); color: var(--color-accent); background: none; &:hover { background: var(--color-accent-lighter); } }
    .action-btn--delete { border-color: var(--color-error); color: var(--color-error); background: none; &:hover { background: var(--color-error-light); } }

    .modal-fields { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); }
    .form-input { width: 100%; padding: var(--space-2) var(--space-3); border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; font-size: var(--text-sm); outline: none; resize: vertical; &:focus { border-color: var(--color-accent); } }

    .cancel-btn { padding: var(--space-2) var(--space-5); border: 1.5px solid var(--color-border); background: none; border-radius: var(--radius-sm); font-family: inherit; cursor: pointer; color: var(--color-text); &:hover { border-color: var(--color-border-hover); } }
    .save-btn { padding: var(--space-2) var(--space-5); background: var(--color-accent); color: white; border: none; border-radius: var(--radius-sm); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; &:hover:not(:disabled) { background: var(--color-accent-hover); } &:disabled { opacity: 0.5; } }
    .delete-btn { padding: var(--space-2) var(--space-5); background: var(--color-error); color: white; border: none; border-radius: var(--radius-sm); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; &:hover:not(:disabled) { background: var(--color-error-hover); } &:disabled { opacity: 0.5; } }

    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `],
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly modalOpen = signal(false);
  protected readonly deleteModalOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly deletingProduct = signal<Product | null>(null);
  protected readonly skeletons = Array(5).fill(0);

  protected readonly productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    priceAfterDiscount: [null as number | null],
    quantity: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    imageCover: [''],
  });

  ngOnInit(): void {
    this.loadProducts();
    this.categoryService.getCategories().subscribe({ next: (r) => this.categories.set(r.data) });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts({ limit: 100 } as any).subscribe({
      next: (r) => { this.products.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.productForm.reset({ price: 0, quantity: 0 });
    this.modalOpen.set(true);
  }

  protected openEdit(p: Product): void {
    this.editingId.set(p._id);
    this.productForm.patchValue({
      name: p.name, description: p.description, price: p.price,
      priceAfterDiscount: p.priceAfterDiscount ?? null, quantity: p.quantity,
      category: typeof p.category === 'string' ? p.category : (p.category as any)._id,
      imageCover: p.imageCover ?? '',
    });
    this.modalOpen.set(true);
  }

  protected closeModal(): void { this.modalOpen.set(false); }

  protected saveProduct(): void {
    if (this.productForm.invalid) return;
    this.saving.set(true);
    const data: any = this.productForm.value;
    if (!data.priceAfterDiscount) delete data.priceAfterDiscount;
    const obs = this.editingId()
      ? this.productService.updateProduct(this.editingId()!, data)
      : this.productService.createProduct(data);
    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.loadProducts();
        this.toast.success(`Product ${this.editingId() ? 'updated' : 'created'}!`);
      },
      error: () => this.saving.set(false),
    });
  }

  protected confirmDelete(p: Product): void {
    this.deletingProduct.set(p);
    this.deleteModalOpen.set(true);
  }

  protected deleteProduct(): void {
    const p = this.deletingProduct();
    if (!p) return;
    this.deleting.set(true);
    this.productService.deleteProduct(p._id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteModalOpen.set(false);
        this.products.update((list) => list.filter((pr) => pr._id !== p._id));
        this.toast.success('Product deleted.');
      },
      error: () => this.deleting.set(false),
    });
  }

  protected getCategoryName(p: Product): string {
    if (typeof p.category === 'string') return this.categories().find((c) => c._id === p.category)?.name ?? '';
    return (p.category as any).name ?? '';
  }
}
