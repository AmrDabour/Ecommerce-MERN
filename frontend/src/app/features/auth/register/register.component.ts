import {
  Component, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, Validators, AbstractControl
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

function passwordMatchValidator(control: AbstractControl) {
  const pass = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card__header">
          <a routerLink="/" class="auth-card__logo">◆ LUXE</a>
          <h1 class="auth-card__title">Create your account</h1>
          <p class="auth-card__subtitle">Join thousands of happy customers</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="name">Full name</label>
            <input id="name" type="text" class="form-input"
              [class.form-input--error]="name.invalid && name.touched"
              formControlName="name" placeholder="Your name" autocomplete="name" />
            @if (name.invalid && name.touched) {
              <span class="form-error">Full name is required.</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-email">Email address</label>
            <input id="reg-email" type="email" class="form-input"
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
            <label class="form-label" for="phone">Phone (optional)</label>
            <input id="phone" type="tel" class="form-input"
              formControlName="phone" placeholder="+20 1234567890" autocomplete="tel" />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password">Password</label>
            <input id="reg-password" type="password" class="form-input"
              [class.form-input--error]="regPassword.invalid && regPassword.touched"
              formControlName="password" placeholder="At least 6 characters" autocomplete="new-password" />
            @if (regPassword.invalid && regPassword.touched) {
              <span class="form-error">
                @if (regPassword.errors?.['required']) { Password is required. }
                @else { Minimum 6 characters. }
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" class="form-input"
              [class.form-input--error]="(confirmPassword.touched || regPassword.touched) && form.hasError('passwordMismatch')"
              formControlName="confirmPassword" placeholder="Repeat your password" autocomplete="new-password" />
            @if (confirmPassword.touched && form.hasError('passwordMismatch')) {
              <span class="form-error">Passwords do not match.</span>
            }
          </div>

          @if (errorMsg()) {
            <div class="form-server-error" role="alert">{{ errorMsg() }}</div>
          }

          <button type="submit" class="auth-btn"
            [disabled]="loading()" [class.auth-btn--loading]="loading()">
            @if (loading()) { <span class="auth-btn__spinner"></span> }
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="auth-card__footer">
          Already have an account?
          <a routerLink="/login" class="auth-link">Sign in →</a>
        </p>
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
      max-width: 480px;
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

    .auth-form { display: flex; flex-direction: column; gap: var(--space-4); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-1); }
    .form-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text); }

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
      margin-top: var(--space-2);
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

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 480px) { .auth-card { padding: var(--space-8) var(--space-6); } }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMsg = signal('');

  protected readonly form = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  protected get name() { return this.form.controls['name']; }
  protected get email() { return this.form.controls['email']; }
  protected get regPassword() { return this.form.controls['password']; }
  protected get confirmPassword() { return this.form.controls['confirmPassword']; }

  protected onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { name, email, password, phone } = this.form.value;
    this.authService.register({ name: name!, email: email!, password: password!, phone: phone || undefined }).subscribe({
      next: () => {
        this.toast.success('Account created! Welcome to LUXE.');
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.error?.msg ?? 'Registration failed. Please try again.');
      },
    });
  }
}
