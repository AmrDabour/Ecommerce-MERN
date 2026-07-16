import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { Coupon } from '../../../core/models/coupon.model';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Coupons Management</h1>
          <p class="admin-desc">Create and manage discount codes for your store.</p>
        </div>
        <button class="btn btn--primary" (click)="openModal()">+ Add Coupon</button>
      </div>

      <div class="table-card">
        @if (loading()) {
          <div class="table-loading">Loading coupons…</div>
        } @else {
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (coupon of coupons(); track coupon._id) {
                  <tr>
                    <td><span class="coupon-code">{{ coupon.code }}</span></td>
                    <td><span class="coupon-discount">{{ coupon.discount }}% OFF</span></td>
                    <td>
                      <span [class.text-error]="isExpired(coupon.expireDate)">
                        {{ formatDate(coupon.expireDate) }}
                      </span>
                    </td>
                    <td>
                      <div class="action-cell">
                        <button class="action-btn action-btn--edit" (click)="openModal(coupon)">✏️</button>
                        <button class="action-btn action-btn--delete" (click)="deleteCoupon(coupon._id)">🗑</button>
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
              <h2 class="modal-title">{{ editingId() ? 'Edit Coupon' : 'Add New Coupon' }}</h2>
              <button class="modal-close" (click)="closeModal()">✕</button>
            </div>
            
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-group">
                <label class="form-label" for="code">Coupon Code</label>
                <input id="code" type="text" class="form-input" formControlName="code" style="text-transform: uppercase;" />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="discount">Discount Percentage (%)</label>
                <input id="discount" type="number" class="form-input" formControlName="discount" min="1" max="100" />
              </div>

              <div class="form-group">
                <label class="form-label" for="expireDate">Expiration Date</label>
                <input id="expireDate" type="date" class="form-input" formControlName="expireDate" />
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn--outline" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn--primary" [disabled]="form.invalid || saving()">
                  {{ saving() ? 'Saving…' : 'Save Coupon' }}
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

    .coupon-code { font-family: monospace; font-weight: var(--weight-bold); background: var(--color-surface-alt); padding: 4px 8px; border-radius: 4px; border: 1px dashed var(--color-border); }
    .coupon-discount { font-weight: var(--weight-bold); color: var(--color-success); }
    .text-error { color: var(--color-error); }

    .action-cell { display: flex; gap: var(--space-2); }
    .action-btn { width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: var(--color-surface); cursor: pointer; transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid var(--color-border); }
    .action-btn:hover { background: var(--color-surface-alt); }
    .action-btn--delete:hover { background: var(--color-error-light); color: var(--color-error); border-color: var(--color-error); }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); backdrop-filter: blur(4px); }
    .modal-content { background: var(--color-surface); border-radius: var(--radius-xl); width: 100%; max-width: 400px; box-shadow: var(--shadow-xl); border: 1px solid var(--color-border); }
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
export class AdminCouponsComponent implements OnInit {
  private readonly couponService = inject(CouponService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly coupons = signal<Coupon[]>([]);
  protected readonly loading = signal(true);

  protected readonly showModal = signal(false);
  protected readonly saving = signal(false);
  protected readonly editingId = signal<string | null>(null);

  protected readonly form = this.fb.group({
    code: ['', Validators.required],
    discount: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    expireDate: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadCoupons();
  }

  private loadCoupons(): void {
    this.loading.set(true);
    this.couponService.getCoupons().subscribe({
      next: (res) => {
        this.coupons.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US');
  }

  protected isExpired(d: string): boolean {
    return new Date(d).getTime() < Date.now();
  }

  protected openModal(coupon?: Coupon): void {
    if (coupon) {
      this.editingId.set(coupon._id);
      this.form.patchValue({
        code: coupon.code,
        discount: coupon.discount,
        // Format date for <input type="date"> which expects YYYY-MM-DD
        expireDate: new Date(coupon.expireDate).toISOString().split('T')[0]
      });
    } else {
      this.editingId.set(null);
      this.form.reset({ discount: 10 });
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
    
    // Ensure code is uppercase
    const data = { ...this.form.value, code: this.form.value.code?.toUpperCase() };

    const req$ = this.editingId()
      ? this.couponService.updateCoupon(this.editingId()!, data as any)
      : this.couponService.createCoupon(data as any);

    req$.subscribe({
      next: () => {
        this.toast.success(`Coupon ${this.editingId() ? 'updated' : 'created'}.`);
        this.saving.set(false);
        this.closeModal();
        this.loadCoupons();
      },
      error: (err) => {
        this.toast.error(err?.error?.msg || 'An error occurred.');
        this.saving.set(false);
      }
    });
  }

  protected deleteCoupon(id: string): void {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    this.couponService.deleteCoupon(id).subscribe({
      next: () => {
        this.toast.success('Coupon deleted.');
        this.loadCoupons();
      },
      error: () => this.toast.error('Could not delete coupon.')
    });
  }
}
