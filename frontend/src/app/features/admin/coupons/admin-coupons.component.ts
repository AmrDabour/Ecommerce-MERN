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
  templateUrl: './admin-coupons.component.html',
  styleUrl: './admin-coupons.component.scss',
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
