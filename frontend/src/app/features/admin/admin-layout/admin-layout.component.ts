import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-layout" style="padding-top: calc(var(--header-height));">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <div class="admin-sidebar__header">
          <div class="admin-avatar">
            {{ authService.currentUser()?.name?.charAt(0)?.toUpperCase() ?? 'A' }}
          </div>
          <div class="admin-info">
            <div class="admin-name">{{ authService.currentUser()?.name }}</div>
            <div class="admin-role">Administrator</div>
          </div>
        </div>

        <nav class="admin-nav">
          <div class="admin-nav__group">Menu</div>
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="admin-nav__link">
            <span class="admin-nav__icon">📊</span> Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="admin-nav__link">
            <span class="admin-nav__icon">🛍</span> Products
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="admin-nav__link">
            <span class="admin-nav__icon">📁</span> Categories
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active" class="admin-nav__link">
            <span class="admin-nav__icon">📦</span> Orders
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="admin-nav__link">
            <span class="admin-nav__icon">👥</span> Users
          </a>
          <a routerLink="/admin/coupons" routerLinkActive="active" class="admin-nav__link">
            <span class="admin-nav__icon">🏷</span> Coupons
          </a>
        </nav>

        <div class="admin-sidebar__footer">
          <a routerLink="/" class="admin-nav__link admin-nav__link--exit">
            <span class="admin-nav__icon">←</span> Back to Store
          </a>
        </div>
      </aside>

      <!-- Admin Main -->
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
      background: var(--color-surface-alt);
    }

    .admin-sidebar {
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      position: sticky;
      top: var(--header-height);
      height: calc(100vh - var(--header-height));
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .admin-sidebar__header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-6);
      border-bottom: 1px solid var(--color-border);
    }

    .admin-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--color-accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      flex-shrink: 0;
    }

    .admin-info { overflow: hidden; }
    .admin-name { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .admin-role { font-size: var(--text-xs); color: var(--color-accent); font-weight: var(--weight-medium); }

    .admin-nav {
      flex: 1;
      padding: var(--space-6) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .admin-nav__group {
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-tertiary);
      margin-bottom: var(--space-2);
      padding-left: var(--space-3);
    }

    .admin-nav__link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast);
      &:hover { background: var(--color-surface-alt); color: var(--color-text); }
    }

    .admin-nav__link.active {
      background: var(--color-accent-lighter);
      color: var(--color-accent);
    }

    .admin-nav__icon { font-size: 1.1rem; display: flex; align-items: center; justify-content: center; width: 24px; }

    .admin-sidebar__footer {
      padding: var(--space-4);
      border-top: 1px solid var(--color-border);
    }

    .admin-nav__link--exit { color: var(--color-text-tertiary); &:hover { color: var(--color-text); } }

    .admin-main {
      padding: var(--space-8);
      overflow-x: hidden;
    }

    @media (max-width: 1024px) {
      .admin-layout { grid-template-columns: 1fr; }
      .admin-sidebar { display: none; } /* Would need a mobile drawer in real app */
    }
  `],
})
export class AdminLayoutComponent {
  protected readonly authService = inject(AuthService);
}
