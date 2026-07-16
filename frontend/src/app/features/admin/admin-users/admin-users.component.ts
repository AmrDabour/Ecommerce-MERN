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
  template: `
    <div class="admin-page">
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Users Management</h1>
          <p class="admin-desc">View and manage customer and admin accounts.</p>
        </div>
      </div>

      <div class="table-card">
        @if (loading()) {
          <div class="table-loading">Loading users…</div>
        } @else {
          <div class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user._id) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                        <div class="user-info">
                          <span class="user-name">{{ user.name }}</span>
                          <span class="user-email">{{ user.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      @if (user.role === 'admin') {
                        <app-badge variant="accent" pill>Admin</app-badge>
                      } @else {
                        <app-badge variant="neutral" pill>Customer</app-badge>
                      }
                    </td>
                    <td>{{ formatDate(user.createdAt) }}</td>
                    <td>
                      <div class="action-cell">
                        <button class="action-btn action-btn--delete" 
                          (click)="deleteUser(user._id)" 
                          [disabled]="user.role === 'admin'"
                          title="Delete User">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-page { display: flex; flex-direction: column; gap: var(--space-6); }
    .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-4); }
    .admin-title { font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--color-text); }
    .admin-desc { font-size: var(--text-sm); color: var(--color-text-tertiary); margin-top: var(--space-1); }

    .table-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: var(--space-4) var(--space-6); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; font-weight: var(--weight-bold); color: var(--color-text-tertiary); border-bottom: 1px solid var(--color-border); background: var(--color-surface-alt); }
    .admin-table td { padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); vertical-align: middle; color: var(--color-text); }
    .admin-table tbody tr:last-child td { border-bottom: none; }
    .admin-table tbody tr:hover { background: var(--color-surface-alt); }

    .table-loading { padding: var(--space-10); text-align: center; color: var(--color-text-tertiary); font-size: var(--text-sm); }

    .user-cell { display: flex; align-items: center; gap: var(--space-3); }
    .user-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--color-accent); color: white; display: flex; align-items: center; justify-content: center; font-size: var(--text-base); font-weight: var(--weight-bold); }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: var(--weight-semibold); color: var(--color-text); }
    .user-email { font-size: var(--text-xs); color: var(--color-text-tertiary); }

    .action-cell { display: flex; gap: var(--space-2); }
    .action-btn { width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: var(--color-surface); cursor: pointer; transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center; font-size: 14px; border: 1px solid var(--color-border); }
    .action-btn:hover:not(:disabled) { background: var(--color-surface-alt); }
    .action-btn--delete:hover:not(:disabled) { background: var(--color-error-light); color: var(--color-error); border-color: var(--color-error); }
    .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
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
