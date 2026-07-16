import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Coupon } from '../../../core/models/coupon.model';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-panel">
      <div class="admin-panel__header">
        <h1>Coupons</h1>
        <button class="add-btn" (click)="openCreate()">+ Add Coupon</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (coupon of coupons(); track coupon._id) {
              <tr>
                <td class="mono coupon-code">{{ coupon.code }}</td>
                <td class="font-semibold">{{ coupon.discount }}%</td>
                <td class="text-muted">{{ formatDate(coupon.expireDate) }}</td>
                <td>
                  @if (isExpired(coupon)) {
                    <app-badge variant="danger">Expired</app-badge>
                  } @else {
                    <app-badge variant="success">Active</app-badge>
                  }
                </td>
                <td>
                  <div class="action-btns">
                    <button class="action-btn action-btn--edit" (click)="openEdit(coupon)">Edit</button>
                    <button class="action-btn action-btn--delete" (click)="confirmDelete(coupon)">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <app-modal [isOpen]="modalOpen()" [title]="editingId() ? 'Edit Coupon' : 'Create Coupon'" size="sm" (close)="closeModal()">
      <form [formGroup]="couponForm">
        <div class="form-fields">
          <div class="form-group">
            <label class="form-label">Code *</label>
            <input type="text" class="form-input" formControlName="code" placeholder="SUMMER20" style="text-transform:uppercase;" />
          </div>
          <div class="form-group">
            <label class="form-label">Discount % (1–100) *</label>
            <input type="number" class="form-input" formControlName="discount" min="1" max="100" />
          </div>
          <div class="form-group">
            <label class="form-label">Expiry Date *</label>
            <input type="date" class="form-input" formControlName="expireDate" />
          </div>
        </div>
      </form>
      <div modal-footer>
        <button class="cancel-btn" (click)="closeModal()">Cancel</button>
        <button class="save-btn" [disabled]="couponForm.invalid || saving()" (click)="save()">
          {{ saving() ? '…' : 'Save' }}
        </button>
      </div>
    </app-modal>

    <app-modal [isOpen]="deleteModalOpen()" title="Delete Coupon" size="sm" (close)="deleteModalOpen.set(false)">
      <p>Delete coupon <strong>{{ deletingCoupon()?.code }}</strong>?</p>
      <div modal-footer>
        <button class="cancel-btn" (click)="deleteModalOpen.set(false)">Cancel</button>
        <button class="delete-btn" [disabled]="deleting()" (click)="doDelete()">
          {{ deleting() ? '…' : 'Delete' }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .admin-panel__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); h1 { font-size: var(--text-2xl); font-weight: var(--weight-bold); } }
    .add-btn { padding: var(--space-2) var(--space-5); background: var(--color-accent); color: white; border: none; border-radius: var(--radius-md); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; font-size: var(--text-sm); &:hover { background: var(--color-accent-hover); } }
    .data-table-wrapper { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: var(--space-3) var(--space-4); text-align: left; font-size: var(--text-xs); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-tertiary); background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); }
    .data-table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--color-surface-alt); }
    .mono { font-family: monospace; }
    .coupon-code { font-weight: var(--weight-bold); font-size: var(--text-base); color: var(--color-accent); letter-spacing: 0.1em; }
    .font-semibold { font-weight: var(--weight-semibold); }
    .text-muted { color: var(--color-text-tertiary); }
    .action-btns { display: flex; gap: var(--space-2); }
    .action-btn { padding: var(--space-1) var(--space-3); border-radius: var(--radius-xs); font-family: inherit; font-size: var(--text-xs); font-weight: var(--weight-semibold); cursor: pointer; border: 1.5px solid; transition: all var(--transition-fast); }
    .action-btn--edit { border-color: var(--color-accent); color: var(--color-accent); background: none; &:hover { background: var(--color-accent-lighter); } }
    .action-btn--delete { border-color: var(--color-error); color: var(--color-error); background: none; &:hover { background: var(--color-error-light); } }
    .form-fields { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); }
    .form-input { width: 100%; padding: var(--space-2) var(--space-3); border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; font-size: var(--text-sm); outline: none; &:focus { border-color: var(--color-accent); } }
    .cancel-btn { padding: var(--space-2) var(--space-5); border: 1.5px solid var(--color-border); background: none; border-radius: var(--radius-sm); font-family: inherit; cursor: pointer; }
    .save-btn { padding: var(--space-2) var(--space-5); background: var(--color-accent); color: white; border: none; border-radius: var(--radius-sm); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; &:disabled { opacity: 0.5; } }
    .delete-btn { padding: var(--space-2) var(--space-5); background: var(--color-error); color: white; border: none; border-radius: var(--radius-sm); font-family: inherit; font-weight: var(--weight-semibold); cursor: pointer; &:disabled { opacity: 0.5; } }
  `],
})
export class AdminCouponsComponent implements OnInit {
  private readonly couponService = inject(CouponService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly coupons = signal<Coupon[]>([]);
  protected readonly modalOpen = signal(false);
  protected readonly deleteModalOpen = signal(false);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly deletingCoupon = signal<Coupon | null>(null);

  protected readonly couponForm = this.fb.group({
    code: ['', Validators.required],
    discount: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    expireDate: ['', Validators.required],
  });

  ngOnInit(): void {
    this.couponService.getCoupons().subscribe({ next: (r) => this.coupons.set(r.data) });
  }

  protected isExpired(c: Coupon): boolean { return new Date(c.expireDate) < new Date(); }

  protected formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  protected openCreate(): void { this.editingId.set(null); this.couponForm.reset({ discount: 10 }); this.modalOpen.set(true); }
  protected openEdit(c: Coupon): void {
    this.editingId.set(c._id);
    this.couponForm.patchValue({ code: c.code, discount: c.discount, expireDate: c.expireDate.split('T')[0] });
    this.modalOpen.set(true);
  }
  protected closeModal(): void { this.modalOpen.set(false); }

  protected save(): void {
    if (this.couponForm.invalid) return;
    this.saving.set(true);
    const data = this.couponForm.value as any;
    data.code = data.code.toUpperCase();
    const obs = this.editingId()
      ? this.couponService.updateCoupon(this.editingId()!, data)
      : this.couponService.createCoupon(data);
    obs.subscribe({
      next: (r) => {
        this.saving.set(false); this.modalOpen.set(false);
        this.editingId()
          ? this.coupons.update((l) => l.map((c) => c._id === r.data._id ? r.data : c))
          : this.coupons.update((l) => [...l, r.data]);
        this.toast.success(`Coupon ${this.editingId() ? 'updated' : 'created'}!`);
      },
      error: () => this.saving.set(false),
    });
  }

  protected confirmDelete(c: Coupon): void { this.deletingCoupon.set(c); this.deleteModalOpen.set(true); }
  protected doDelete(): void {
    this.deleting.set(true);
    this.couponService.deleteCoupon(this.deletingCoupon()!._id).subscribe({
      next: () => {
        this.coupons.update((l) => l.filter((c) => c._id !== this.deletingCoupon()!._id));
        this.deleting.set(false); this.deleteModalOpen.set(false);
        this.toast.success('Coupon deleted.');
      },
      error: () => this.deleting.set(false),
    });
  }
}
