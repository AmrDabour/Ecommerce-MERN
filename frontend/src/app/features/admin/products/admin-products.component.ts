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
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
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
    colors: [''],
    sizes: [''],
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
    this.productForm.reset({ price: 0, quantity: 0, colors: '', sizes: '' });
    this.modalOpen.set(true);
  }

  protected openEdit(p: Product): void {
    this.editingId.set(p._id);
    this.productForm.patchValue({
      name: p.name, description: p.description, price: p.price,
      priceAfterDiscount: p.priceAfterDiscount ?? null, quantity: p.quantity,
      category: typeof p.category === 'string' ? p.category : (p.category as any)._id,
      imageCover: p.imageCover ?? '',
      colors: p.colors?.join(', ') ?? '',
      sizes: p.sizes?.join(', ') ?? '',
    });
    this.modalOpen.set(true);
  }

  protected closeModal(): void { this.modalOpen.set(false); }

  protected saveProduct(): void {
    if (this.productForm.invalid) return;
    this.saving.set(true);
    const formValue = this.productForm.value;
    const data: any = { ...formValue };
    
    if (!data.priceAfterDiscount) delete data.priceAfterDiscount;
    
    // Process colors and sizes (convert comma separated strings to arrays)
    if (data.colors) {
      data.colors = data.colors.split(',').map((c: string) => c.trim()).filter(Boolean);
    } else {
      data.colors = [];
    }
    
    if (data.sizes) {
      data.sizes = data.sizes.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else {
      data.sizes = [];
    }

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
