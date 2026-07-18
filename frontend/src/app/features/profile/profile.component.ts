import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { RouterLink } from '@angular/router';
import { ReferralService, ReferralInfo } from '../../core/services/referral.service';
import { GiftCardService } from '../../core/services/gift-card.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly referralService = inject(ReferralService);
  private readonly giftCardService = inject(GiftCardService);

  protected readonly saving = signal(false);
  protected readonly redeeming = signal(false);
  protected readonly referralInfo = signal<ReferralInfo | null>(null);
  protected readonly loadingReferral = signal(true);
  protected readonly converting = signal(false);

  protected readonly form = this.fb.group({
    phone: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      zip: [''],
    }),
  });

  protected readonly giftCardForm = this.fb.group({
    code: ['', Validators.required],
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({
        phone: user.phone || '',
        address: user.address || { street: '', city: '', zip: '' },
      });
      
      this.referralService.getMyInfo().subscribe({
        next: (res) => {
          this.referralInfo.set(res.data);
          this.loadingReferral.set(false);
        },
        error: () => {
          this.loadingReferral.set(false);
        }
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const userId = this.authService.currentUser()?._id;
    if (!userId) return;

    this.userService.updateUser(userId, this.form.value as any).subscribe({
      next: (res) => {
        this.authService.updateCachedUser(res.data);
        this.saving.set(false);
        this.form.markAsPristine();
        this.toast.success('Profile updated successfully');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to update profile');
      },
    });
  }

  protected convertPoints(): void {
    const user = this.authService.currentUser();
    if (!user || !user.points || user.points <= 0) {
      this.toast.error('You do not have enough points to convert.');
      return;
    }

    const pointsToConvert = parseInt(prompt(`How many points do you want to convert? (Max: ${user.points})`, user.points.toString()) || '0', 10);
    if (isNaN(pointsToConvert) || pointsToConvert <= 0) return;
    
    if (pointsToConvert > user.points) {
      this.toast.error('You cannot convert more points than you have.');
      return;
    }

    this.converting.set(true);
    this.userService.convertPointsToWallet(pointsToConvert).subscribe({
      next: (res) => {
        this.converting.set(false);
        this.toast.success(res.msg);
        // Update user state
        this.authService.updateCachedUser({ 
          ...user, 
          points: res.points, 
          walletBalance: res.walletBalance 
        });
      },
      error: (err) => {
        this.converting.set(false);
        this.toast.error(err.error?.msg || 'Failed to convert points');
      }
    });
  }

  protected redeemGiftCard(): void {
    if (this.giftCardForm.invalid) return;
    this.redeeming.set(true);
    const code = this.giftCardForm.value.code!;
    
    this.giftCardService.redeemGiftCard(code).subscribe({
      next: (res) => {
        this.redeeming.set(false);
        this.toast.success(res.msg);
        this.giftCardForm.reset();
        
        // Update wallet balance
        const user = this.authService.currentUser();
        if (user) {
          this.authService.updateCachedUser({
            ...user,
            walletBalance: res.newBalance
          });
        }
      },
      error: (err) => {
        this.redeeming.set(false);
        this.toast.error(err.error?.msg || 'Failed to redeem gift card');
      }
    });
  }
}
