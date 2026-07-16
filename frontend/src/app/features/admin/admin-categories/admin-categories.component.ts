import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss',
})
export class AdminCategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);

  protected readonly showModal = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    image: ['']
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US');
  }

  protected openModal(cat?: Category): void {
    if (cat) {
      this.editingId.set(cat._id);
      this.form.patchValue({
        name: cat.name,
        description: cat.description || '',
        image: cat.image || ''
      });
    } else {
      this.editingId.set(null);
      this.form.reset();
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
    
    const req$ = this.editingId()
      ? this.categoryService.updateCategory(this.editingId()!, this.form.value as any)
      : this.categoryService.createCategory(this.form.value as any);

    req$.subscribe({
      next: () => {
        this.toast.success(`Category ${this.editingId() ? 'updated' : 'created'}.`);
        this.saving.set(false);
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.toast.error(err?.error?.msg || 'An error occurred.');
        this.saving.set(false);
      }
    });
  }

  protected deleteCategory(id: string): void {
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.toast.success('Category deleted.');
        this.loadCategories();
      },
      error: () => this.toast.error('Could not delete category.')
    });
  }
}
