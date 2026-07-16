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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
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
