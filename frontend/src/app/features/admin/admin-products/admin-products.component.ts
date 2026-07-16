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
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
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
