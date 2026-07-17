import {
  Component, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GoogleSigninButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly socialAuthService = inject(SocialAuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly errorMsg = signal('');

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });

  protected get email() { return this.form.controls['email']; }
  protected get password() { return this.form.controls['password']; }

  constructor() {
    this.socialAuthService.authState.pipe(takeUntilDestroyed()).subscribe((user) => {
      if (user && user.idToken) {
        this.loading.set(true);
        this.authService.googleLogin(user.idToken).subscribe({
          next: () => {
            this.cartService.mergeGuestCart().then(() => {
              this.cartService.fetchCart().subscribe();
            });
            this.toast.success('Welcome back with Google!');
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
            this.router.navigateByUrl(returnUrl);
          },
          error: (err) => {
            this.loading.set(false);
            this.errorMsg.set('Google login failed. Please try again.');
          }
        });
      }
    });
  }

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
