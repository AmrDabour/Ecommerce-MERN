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
  templateUrl: './admin-coupons.component.html',
  styleUrl: './admin-coupons.component.scss',
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
