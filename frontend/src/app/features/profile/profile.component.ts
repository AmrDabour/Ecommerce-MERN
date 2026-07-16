import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-content container" style="padding-top: calc(var(--header-height) + var(--space-8));">
      <div class="profile-layout">
        <!-- Sidebar -->
        <aside class="profile-sidebar">
          <div class="profile-avatar">
            <div class="profile-avatar__circle">
              {{ authService.currentUser()?.name?.charAt(0)?.toUpperCase() ?? 'U' }}
            </div>
            <h2 class="profile-avatar__name">{{ authService.currentUser()?.name }}</h2>
            <div class="profile-avatar__email">{{ authService.currentUser()?.email }}</div>
            <div class="profile-avatar__role">
              {{ authService.currentUser()?.role === 'admin' ? '🛡 Admin' : 'Customer' }}
            </div>
          </div>

          <nav class="profile-nav">
            <a routerLink="/profile" class="profile-nav__link profile-nav__link--active">My Profile</a>
            <a routerLink="/orders" class="profile-nav__link">My Orders</a>
            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="profile-nav__link profile-nav__link--admin">Admin Panel</a>
            }
          </nav>
        </aside>

        <!-- Main Content -->
        <div class="profile-main">
          <h1 class="profile-title">Profile Settings</h1>

          <div class="profile-card">
            <h2 class="profile-card__title">Personal Information</h2>
            <p class="profile-card__desc">Update your personal details and address.</p>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="profile-form">
              <div class="form-group">
                <label class="form-label" for="phone">Phone Number</label>
                <input id="phone" type="tel" class="form-input" formControlName="phone" placeholder="+1234567890" />
              </div>

              <div class="form-section-title">Shipping Address</div>

              <div class="form-group" formGroupName="address">
                <label class="form-label" for="street">Street Address</label>
                <input id="street" type="text" class="form-input" formControlName="street" placeholder="123 Main St" />
              </div>

              <div class="form-row" formGroupName="address">
                <div class="form-group">
                  <label class="form-label" for="city">City</label>
                  <input id="city" type="text" class="form-input" formControlName="city" placeholder="Cairo" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="zip">ZIP Code</label>
                  <input id="zip" type="text" class="form-input" formControlName="zip" placeholder="12345" />
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="profile-submit" [disabled]="saving() || form.pristine">
                  @if (saving()) { <span class="profile-spinner"></span> }
                  {{ saving() ? 'Saving…' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: var(--space-8); align-items: start; }

    .profile-sidebar { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); }
    .profile-avatar { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: var(--space-6); padding-bottom: var(--space-6); border-bottom: 1px solid var(--color-border); }
    .profile-avatar__circle { width: 80px; height: 80px; border-radius: 50%; background: var(--color-accent); color: white; display: flex; align-items: center; justify-content: center; font-size: var(--text-3xl); font-weight: var(--weight-bold); margin-bottom: var(--space-4); }
    .profile-avatar__name { font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--color-text); margin-bottom: var(--space-1); }
    .profile-avatar__email { font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-2); }
    .profile-avatar__role { font-size: var(--text-xs); font-weight: var(--weight-semibold); padding: 2px 8px; background: var(--color-surface-alt); border-radius: var(--radius-full); color: var(--color-text-tertiary); }

    .profile-nav { display: flex; flex-direction: column; gap: var(--space-1); }
    .profile-nav__link { padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text-secondary); text-decoration: none; transition: all var(--transition-fast); &:hover { background: var(--color-surface-alt); color: var(--color-text); } }
    .profile-nav__link--active { background: var(--color-accent-lighter); color: var(--color-accent); &:hover { background: var(--color-accent-lighter); color: var(--color-accent); } }
    .profile-nav__link--admin { color: var(--color-warning); &:hover { background: rgba(217,119,6,0.08); color: var(--color-warning); } }

    .profile-title { font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-6); }
    .profile-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-8); }
    .profile-card__title { font-size: var(--text-lg); font-weight: var(--weight-semibold); margin-bottom: var(--space-1); }
    .profile-card__desc { font-size: var(--text-sm); color: var(--color-text-tertiary); margin-bottom: var(--space-6); }

    .profile-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); }
    .form-input { padding: var(--space-3) var(--space-4); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-sm); font-family: inherit; background: var(--color-surface); color: var(--color-text); transition: border-color var(--transition-fast); outline: none; &:focus { border-color: var(--color-accent); } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .form-section-title { font-size: var(--text-base); font-weight: var(--weight-semibold); color: var(--color-text); margin-top: var(--space-4); padding-bottom: var(--space-2); border-bottom: 1px solid var(--color-border); }

    .form-actions { margin-top: var(--space-6); display: flex; justify-content: flex-end; }
    .profile-submit { padding: var(--space-3) var(--space-8); background: var(--color-accent); color: white; border: none; border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: var(--weight-semibold); cursor: pointer; display: flex; align-items: center; gap: var(--space-2); transition: all var(--transition-fast); &:hover:not(:disabled) { background: var(--color-accent-hover); } &:disabled { opacity: 0.6; cursor: not-allowed; } }
    .profile-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 600ms linear infinite; }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 767px) { .profile-layout { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `],
})
export class ProfileComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    phone: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      zip: [''],
    }),
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({
        phone: user.phone || '',
        address: user.address || { street: '', city: '', zip: '' },
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
}
