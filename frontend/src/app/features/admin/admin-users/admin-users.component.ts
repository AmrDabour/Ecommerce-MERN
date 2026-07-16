import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { User } from '../../../core/models/user.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  protected readonly users = signal<User[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US');
  }

  protected deleteUser(id: string): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.toast.success('User deleted successfully.');
        this.loadUsers();
      },
      error: () => this.toast.error('Could not delete user.')
    });
  }
}
