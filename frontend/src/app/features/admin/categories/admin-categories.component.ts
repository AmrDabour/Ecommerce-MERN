import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Category } from '../../../core/models/category.model';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h1>Categories</h1>
        <button class="add-btn" (click)="openCreate()">+ Add Category</button>
      </div>

      <div class="cat-grid">
        @if (loading()) {
          @for (i of skeletons; track i) {
            <div class="cat-skeleton"></div>
          }
        }
        @for (cat of categories(); track cat._id) {
          <div class="cat-card">
            @if (cat.image) {
              <img [src]="cat.image" [alt]="cat.name" class="cat-card__img" />
            } @else {
              <div class="cat-card__placeholder">🏷️</div>
            }
            <h3 class="cat-card__name">{{ cat.name }}</h3>
            @if (cat.description) {
              <p class="cat-card__desc">{{ cat.description }}</p>
            }
            <div class="cat-card__actions">
              <button class="action-btn action-btn--edit" (click)="openEdit(cat)">Edit</button>
              <button class="action-btn action-btn--delete" (click)="confirmDelete(cat)">Delete</button>
            </div>
          </div>
        }
      </div>
    </div>

    <app-modal [isOpen]="modalOpen()" [title]="editingId() ? 'Edit Category' : 'Add Category'" size="sm" (close)="closeModal()">
      <form [formGroup]="catForm">
        <div class="form-fields">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input type="text" class="form-input" formControlName="name" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-input" formControlName="description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="url" class="form-input" formControlName="image" />
          </div>
        </div>
      </form>
      <div modal-footer>
        <button class="cancel-btn" (click)="closeModal()">Cancel</button>
        <button class="save-btn" [disabled]="catForm.invalid || saving()" (click)="save()">
          {{ saving() ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </app-modal>

    <app-modal [isOpen]="deleteModalOpen()" title="Delete Category" size="sm" (close)="deleteModalOpen.set(false)">
      <p>Delete <strong>{{ deletingCat()?.name }}</strong>?</p>
      <div modal-footer>
        <button class="cancel-btn" (click)="deleteModalOpen.set(false)">Cancel</button>
        <button class="delete-btn" [disabled]="deleting()" (click)="doDelete()">
          {{ deleting() ? '…' : 'Delete' }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .admin-panel__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); }
    .admin-panel__header h1 { font-size: var(--text-2xl); font-weight: var(--weight-bold); }
    .add-btn { padding: var(--space-2) var(--space-5); background: var(--color-accent); color: white; border: none; border-radius: var(--radius-md); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; font-size: var(--text-sm); transition: background var(--transition-fast); &:hover { background: var(--color-accent-hover); } }

    .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-5); }
    .cat-skeleton { height: 200px; background: linear-gradient(90deg, var(--color-surface-alt) 25%, #f0f0f0 50%, var(--color-surface-alt) 75%); background-size: 200% 100%; border-radius: var(--radius-lg); animation: shimmer 1.5s infinite; }

    .cat-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
    .cat-card__img { width: 100%; height: 120px; object-fit: cover; }
    .cat-card__placeholder { height: 120px; background: var(--color-surface-alt); display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .cat-card__name { font-weight: var(--weight-semibold); font-size: var(--text-base); padding: var(--space-3) var(--space-4) var(--space-1); }
    .cat-card__desc { font-size: var(--text-xs); color: var(--color-text-tertiary); padding: 0 var(--space-4); }
    .cat-card__actions { display: flex; gap: var(--space-2); padding: var(--space-3) var(--space-4) var(--space-4); }

    .action-btn { padding: var(--space-1) var(--space-3); border-radius: var(--radius-xs); font-family: inherit; font-size: var(--text-xs); font-weight: var(--weight-semibold); cursor: pointer; border: 1.5px solid; transition: all var(--transition-fast); }
    .action-btn--edit { border-color: var(--color-accent); color: var(--color-accent); background: none; &:hover { background: var(--color-accent-lighter); } }
    .action-btn--delete { border-color: var(--color-error); color: var(--color-error); background: none; &:hover { background: var(--color-error-light); } }

    .form-fields { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); }
    .form-input { width: 100%; padding: var(--space-2) var(--space-3); border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; font-size: var(--text-sm); outline: none; resize: vertical; &:focus { border-color: var(--color-accent); } }
    .cancel-btn { padding: var(--space-2) var(--space-5); border: 1.5px solid var(--color-border); background: none; border-radius: var(--radius-sm); font-family: inherit; cursor: pointer; }
    .save-btn { padding: var(--space-2) var(--space-5); background: var(--color-accent); color: white; border: none; border-radius: var(--radius-sm); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; &:disabled { opacity: 0.5; } }
    .delete-btn { padding: var(--space-2) var(--space-5); background: var(--color-error); color: white; border: none; border-radius: var(--radius-sm); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; &:disabled { opacity: 0.5; } }

    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  `],
})
export class AdminCategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly modalOpen = signal(false);
  protected readonly deleteModalOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly deletingCat = signal<Category | null>(null);
  protected readonly skeletons = Array(6).fill(0);

  protected readonly catForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    image: [''],
  });

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (r) => { this.categories.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected openCreate(): void { this.editingId.set(null); this.catForm.reset(); this.modalOpen.set(true); }
  protected openEdit(c: Category): void { this.editingId.set(c._id); this.catForm.patchValue(c); this.modalOpen.set(true); }
  protected closeModal(): void { this.modalOpen.set(false); }

  protected save(): void {
    if (this.catForm.invalid) return;
    this.saving.set(true);
    const data = this.catForm.value as any;
    const obs = this.editingId()
      ? this.categoryService.updateCategory(this.editingId()!, data)
      : this.categoryService.createCategory(data);
    obs.subscribe({
      next: (r) => {
        this.saving.set(false); this.modalOpen.set(false);
        this.editingId()
          ? this.categories.update((l) => l.map((c) => c._id === r.data._id ? r.data : c))
          : this.categories.update((l) => [...l, r.data]);
        this.toast.success(`Category ${this.editingId() ? 'updated' : 'created'}!`);
      },
      error: () => this.saving.set(false),
    });
  }

  protected confirmDelete(c: Category): void { this.deletingCat.set(c); this.deleteModalOpen.set(true); }

  protected doDelete(): void {
    this.deleting.set(true);
    this.categoryService.deleteCategory(this.deletingCat()!._id).subscribe({
      next: () => {
        this.categories.update((l) => l.filter((c) => c._id !== this.deletingCat()!._id));
        this.deleting.set(false); this.deleteModalOpen.set(false);
        this.toast.success('Category deleted.');
      },
      error: () => this.deleting.set(false),
    });
  }
}
