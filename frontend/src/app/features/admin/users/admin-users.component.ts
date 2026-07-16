import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-panel">
      <h1 class="page-title">Users ({{ users().length }})</h1>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user._id) {
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                    <span class="font-medium">{{ user.name }}</span>
                  </div>
                </td>
                <td class="text-muted">{{ user.email }}</td>
                <td class="text-muted">{{ user.phone || '—' }}</td>
                <td>
                  @if (user.role === 'admin') {
                    <app-badge variant="accent">Admin</app-badge>
                  } @else {
                    <app-badge variant="neutral">User</app-badge>
                  }
                </td>
                <td class="text-muted">{{ formatDate(user.createdAt) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: var(--text-2xl); font-weight: var(--weight-bold); margin-bottom: var(--space-6); }
    .data-table-wrapper { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: var(--space-3) var(--space-4); text-align: left; font-size: var(--text-xs); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-tertiary); background: var(--color-surface-alt); border-bottom: 1px solid var(--color-border); }
    .data-table td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); font-size: var(--text-sm); vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: var(--color-surface-alt); }
    .user-cell { display: flex; align-items: center; gap: var(--space-3); }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-accent-light); color: var(--color-accent); display: flex; align-items: center; justify-content: center; font-weight: var(--weight-bold); font-size: var(--text-sm); flex-shrink: 0; }
    .font-medium { font-weight: var(--weight-medium); }
    .text-muted { color: var(--color-text-tertiary); }
  `],
})
export class AdminUsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly users = signal<User[]>([]);

  ngOnInit(): void {
    this.userService.getUsers().subscribe({ next: (r) => this.users.set(r.data) });
  }

  protected formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
