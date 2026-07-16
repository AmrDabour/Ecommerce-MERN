import {
  Component, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card__header">
          <a routerLink="/" class="auth-card__logo">◆ LUXE</a>
          <h1 class="auth-card__title">Welcome back</h1>
          <p class="auth-card__subtitle">Sign in to your account to continue</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="login-email">Email address</label>
            <input id="login-email" type="email" class="form-input"
              [class.form-input--error]="email.invalid && email.touched"
              formControlName="email" placeholder="you@example.com" autocomplete="email" />
            @if (email.invalid && email.touched) {
              <span class="form-error">
                @if (email.errors?.['required']) { Email is required. }
                @else { Please enter a valid email. }
              </span>
            }
          </div>

          <div class="form-group">
            <div class="form-label-row">
              <label class="form-label" for="login-password">Password</label>
            </div>
            <input id="login-password" type="password" class="form-input"
              [class.form-input--error]="password.invalid && password.touched"
              formControlName="password" placeholder="Your password" autocomplete="current-password" />
            @if (password.invalid && password.touched) {
              <span class="form-error">Password is required.</span>
            }
          </div>

          <div class="form-options">
            <label class="form-checkbox">
              <input type="checkbox" formControlName="remember" />
              <span class="form-checkbox__label">Remember me</span>
            </label>
          </div>

          @if (errorMsg()) {
            <div class="form-server-error" role="alert">{{ errorMsg() }}</div>
          }

          <button type="submit" id="login-submit-btn" class="auth-btn"
            [disabled]="loading()" [class.auth-btn--loading]="loading()">
            @if (loading()) { <span class="auth-btn__spinner"></span> }
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="auth-card__footer">
          Don't have an account?
          <a routerLink="/register" class="auth-link">Create one →</a>
        </p>

        <div class="auth-divider">
          <span>Demo credentials</span>
        </div>
        <div class="auth-demos">
          <button type="button" class="demo-btn" (click)="fillDemo('user')">
            👤 User: ahmed@example.com
          </button>
          <button type="button" class="demo-btn demo-btn--admin" (click)="fillDemo('admin')">
            🛡 Admin: admin@example.com
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) var(--space-4);
      background: linear-gradient(135deg, var(--color-accent-lighter) 0%, var(--color-surface) 60%);
      padding-top: calc(var(--header-height) + var(--space-8));
    }

    .auth-card {
      width: 100%;
      max-width: 460px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-10);
      box-shadow: var(--shadow-xl);
      animation: fadeInUp 400ms ease both;
    }

    .auth-card__header { text-align: center; margin-bottom: var(--space-8); }

    .auth-card__logo {
      display: inline-block;
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-extrabold);
      letter-spacing: 0.15em;
      color: var(--color-accent);
      text-decoration: none;
      margin-bottom: var(--space-6);
    }

    .auth-card__title { font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-2); }
    .auth-card__subtitle { font-size: var(--text-sm); color: var(--color-text-tertiary); }

    .auth-form { display: flex; flex-direction: column; gap: var(--space-5); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); }
    .form-label-row { display: flex; justify-content: space-between; align-items: center; }

    .form-input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: var(--text-base);
      font-family: inherit;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      outline: none;
      &::placeholder { color: var(--color-text-tertiary); }
      &:hover:not(:disabled) { border-color: var(--color-border-hover); }
      &:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(4,120,87,0.12); }
    }

    .form-input--error {
      border-color: var(--color-error) !important;
      &:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.12) !important; }
    }

    .form-error { font-size: var(--text-xs); color: var(--color-error); }

    .form-options {
      display: flex;
      align-items: center;
    }

    .form-checkbox {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
    }

    .form-checkbox input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--color-accent);
      cursor: pointer;
    }

    .form-checkbox__label { font-size: var(--text-sm); color: var(--color-text-secondary); }

    .form-server-error {
      padding: var(--space-3) var(--space-4);
      background: var(--color-error-light);
      color: var(--color-error);
      border: 1px solid var(--color-error);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
    }

    .auth-btn {
      width: 100%;
      padding: var(--space-4);
      background: var(--color-accent);
      color: var(--color-text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      min-height: 52px;
      &:hover:not(:disabled) { background: var(--color-accent-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }

    .auth-btn__spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    .auth-card__footer { text-align: center; margin-top: var(--space-6); font-size: var(--text-sm); color: var(--color-text-tertiary); }
    .auth-link { color: var(--color-accent); font-weight: var(--weight-medium); text-decoration: none; &:hover { text-decoration: underline; } }

    .auth-divider {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-top: var(--space-6);
      &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--color-border);
      }
      span { font-size: var(--text-xs); color: var(--color-text-tertiary); white-space: nowrap; }
    }

    .auth-demos {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-3);
    }

    .demo-btn {
      width: 100%;
      padding: var(--space-2) var(--space-4);
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: inherit;
      text-align: left;
      &:hover { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-lighter); }
    }

    .demo-btn--admin {
      &:hover { border-color: var(--color-warning); color: var(--color-warning); background: rgba(217,119,6,0.08); }
    }

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 480px) { .auth-card { padding: var(--space-8) var(--space-6); } }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMsg = signal('');

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });

  protected get email() { return this.form.controls['email']; }
  protected get password() { return this.form.controls['password']; }

  protected fillDemo(role: 'user' | 'admin'): void {
    if (role === 'admin') {
      this.form.patchValue({ email: 'admin@example.com', password: 'admin123' });
    } else {
      this.form.patchValue({ email: 'ahmed@example.com', password: 'password123' });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.cartService.mergeGuestCart().then(() => {
          this.cartService.fetchCart().subscribe();
        });
        this.toast.success('Welcome back!');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.msg ?? 'Login failed. Check your credentials and try again.');
      },
    });
  }
}
