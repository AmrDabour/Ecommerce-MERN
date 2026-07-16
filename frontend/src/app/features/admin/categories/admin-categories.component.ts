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
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.scss',
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
