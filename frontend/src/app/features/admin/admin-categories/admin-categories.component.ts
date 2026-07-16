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
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Categories Management</h1>
          <p class="admin-desc">Organize your store by adding or editing product categories.</p>
        </div>
        <button class="btn btn--primary" (click)="openModal()">+ Add Category</button>
      </div>

      <div class="table-card">
        @if (loading()) {
          <div class="table-loading">Loading categories…</div>
        } @else {
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (cat of categories(); track cat._id) {
                  <tr>
                    <td>
                      <div class="cat-cell">
                        <div class="cat-img">
                          @if (cat.image) {
                            <img [src]="cat.image" alt="" />
                          } @else {
                            <span>📁</span>
                          }
                        </div>
                        <span class="cat-name">{{ cat.name }}</span>
                      </div>
                    </td>
                    <td><span class="cat-desc" [title]="cat.description">{{ cat.description || '—' }}</span></td>
                    <td>{{ formatDate(cat.createdAt) }}</td>
                    <td>
                      <div class="action-cell">
                        <button class="action-btn action-btn--edit" (click)="openModal(cat)">✏️</button>
                        <button class="action-btn action-btn--delete" (click)="deleteCategory(cat._id)">🗑</button>
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
              <h2 class="modal-title">{{ editingId() ? 'Edit Category' : 'Add New Category' }}</h2>
              <button class="modal-close" (click)="closeModal()">✕</button>
            </div>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-group">
                <label class="form-label" for="name">Category Name</label>
                <input id="name" type="text" class="form-input" formControlName="name" />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="description">Description</label>
                <textarea id="description" class="form-input" formControlName="description" rows="3"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="image">Image URL</label>
                <input id="image" type="text" class="form-input" formControlName="image" placeholder="https://example.com/cat.jpg" />
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn--outline" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving()">
                  {{ saving() ? 'Saving…' : 'Save Category' }}
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

    .cat-cell { display: flex; align-items: center; gap: var(--space-4); }
    .cat-img { width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--color-surface-alt); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; border: 1px solid var(--color-border); overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } }
    .cat-name { font-weight: var(--weight-semibold); color: var(--color-text); }
    .cat-desc { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 300px; color: var(--color-text-secondary); }

    .action-cell { display: flex; gap: var(--space-2); }
    .action-btn { width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: var(--color-surface); cursor: pointer; transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid var(--color-border); }
    .action-btn:hover { background: var(--color-surface-alt); }
    .action-btn--delete:hover { background: var(--color-error-light); color: var(--color-error); border-color: var(--color-error); }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); backdrop-filter: blur(4px); }
    .modal-content { background: var(--color-surface); border-radius: var(--radius-xl); width: 100%; max-width: 500px; box-shadow: var(--shadow-xl); border: 1px solid var(--color-border); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--color-border); }
    .modal-title { font-size: var(--text-lg); font-weight: var(--weight-bold); }
    .modal-close { background: none; border: none; font-size: var(--text-xl); color: var(--color-text-tertiary); cursor: pointer; &:hover { color: var(--color-text); } }
    .modal-form { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); }
    .form-input { padding: var(--space-3); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-family: inherit; background: var(--color-surface); outline: none; &:focus { border-color: var(--color-accent); } }
    .modal-footer { display: flex; justify-content: flex-end; gap: var(--space-3); padding-top: var(--space-6); margin-top: var(--space-2); border-top: 1px solid var(--color-border); }
  `]
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
