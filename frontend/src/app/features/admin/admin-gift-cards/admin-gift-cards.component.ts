import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GiftCardService, GiftCard } from '../../../core/services/gift-card.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-admin-gift-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-gift-cards.component.html',
  styleUrl: './admin-gift-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGiftCardsComponent implements OnInit {
  private readonly giftCardService = inject(GiftCardService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly giftCards = signal<GiftCard[]>([]);
  protected readonly loading = signal(true);
  protected readonly creating = signal(false);

  protected readonly form = this.fb.group({
    amount: [100, [Validators.required, Validators.min(1)]],
    expiryDays: [30, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadGiftCards();
  }

  protected loadGiftCards(): void {
    this.loading.set(true);
    this.giftCardService.getAllGiftCards().subscribe({
      next: (res: any) => {
        this.giftCards.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load gift cards');
      }
    });
  }

  protected createGiftCard(): void {
    if (this.form.invalid) return;
    
    this.creating.set(true);
    const amount = this.form.value.amount!;
    const days = this.form.value.expiryDays!;
    
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    this.giftCardService.createGiftCard(amount, expiryDate.toISOString()).subscribe({
      next: (res: any) => {
        this.creating.set(false);
        this.toast.success(res.msg);
        this.loadGiftCards();
        this.form.reset({ amount: 100, expiryDays: 30 });
      },
      error: (err: any) => {
        this.creating.set(false);
        this.toast.error(err.error?.msg || 'Failed to create gift card');
      }
    });
  }
}
