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
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
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
