import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar__header">
          <a routerLink="/" class="admin-sidebar__logo">
            <span class="admin-sidebar__logo-icon">◆</span>
            <span class="admin-sidebar__logo-text">LUXE Admin</span>
          </a>
        </div>

        <nav class="admin-sidebar__nav">
          <a routerLink="/admin/dashboard" routerLinkActive="admin-sidebar__link--active" class="admin-sidebar__link">
            <span class="admin-sidebar__link-icon">📊</span>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="admin-sidebar__link--active" class="admin-sidebar__link">
            <span class="admin-sidebar__link-icon">📦</span>
            Products
          </a>
          <a routerLink="/admin/categories" routerLinkActive="admin-sidebar__link--active" class="admin-sidebar__link">
            <span class="admin-sidebar__link-icon">🏷️</span>
            Categories
          </a>
          <a routerLink="/admin/orders" routerLinkActive="admin-sidebar__link--active" class="admin-sidebar__link">
            <span class="admin-sidebar__link-icon">🧾</span>
            Orders
          </a>
          <a routerLink="/admin/users" routerLinkActive="admin-sidebar__link--active" class="admin-sidebar__link">
            <span class="admin-sidebar__link-icon">👥</span>
            Users
          </a>
          <a routerLink="/admin/coupons" routerLinkActive="admin-sidebar__link--active" class="admin-sidebar__link">
            <span class="admin-sidebar__link-icon">🎟️</span>
            Coupons
          </a>
        </nav>

        <div class="admin-sidebar__footer">
          <a routerLink="/" class="admin-sidebar__link">
            <span class="admin-sidebar__link-icon">←</span>
            Back to Store
          </a>
        </div>
      </aside>

      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
    }

    .admin-sidebar {
      width: var(--sidebar-width);
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: var(--z-sticky);
    }

    .admin-sidebar__header {
      padding: var(--space-5) var(--space-5);
      border-bottom: 1px solid var(--color-border);
    }

    .admin-sidebar__logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
    }

    .admin-sidebar__logo-icon {
      color: var(--color-accent);
      font-size: var(--text-lg);
    }

    .admin-sidebar__logo-text {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: var(--weight-bold);
      color: var(--color-text);
    }

    .admin-sidebar__nav {
      flex: 1;
      padding: var(--space-4) var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      overflow-y: auto;
    }

    .admin-sidebar__link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-surface-alt);
        color: var(--color-text);
      }
    }

    .admin-sidebar__link--active {
      background: var(--color-accent-lighter) !important;
      color: var(--color-accent) !important;
      font-weight: var(--weight-semibold);
    }

    .admin-sidebar__link-icon {
      font-size: var(--text-base);
      width: 24px;
      text-align: center;
    }

    .admin-sidebar__footer {
      padding: var(--space-4) var(--space-3);
      border-top: 1px solid var(--color-border);
    }

    .admin-main {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: var(--space-8);
      background: var(--color-surface-alt);
      min-height: 100vh;
    }

    @media (max-width: 767px) {
      .admin-sidebar {
        transform: translateX(-100%);
        transition: transform var(--transition-normal);
      }

      .admin-main {
        margin-left: 0;
      }
    }
  `],
})
export class AdminLayoutComponent {}
