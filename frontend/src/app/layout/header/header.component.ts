import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header" [class.header--scrolled]="isScrolled()">
      <div class="header__inner container">
        <!-- Logo -->
        <a routerLink="/" class="header__logo">
          <img src="https://img.icons8.com/fluency/96/diamond.png" alt="Luxe Logo" class="header__logo-img">
          <span class="header__logo-text">LUXE</span>
        </a>

        <!-- Desktop Nav -->
        <nav class="header__nav" [class.header__nav--open]="mobileMenuOpen()">
          <a
            routerLink="/"
            routerLinkActive="header__nav-link--active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="header__nav-link"
            (click)="closeMobileMenu()"
          >
            Home
          </a>
          <a
            routerLink="/products"
            routerLinkActive="header__nav-link--active"
            class="header__nav-link"
            (click)="closeMobileMenu()"
          >
            Shop
          </a>
          @if (auth.isAdmin()) {
            <a
              routerLink="/admin"
              routerLinkActive="header__nav-link--active"
              class="header__nav-link header__nav-link--admin"
              (click)="closeMobileMenu()"
            >
              🛡 Admin
            </a>
          }
          <!-- Mobile-only auth links -->
          @if (!auth.isAuthenticated()) {
            <a routerLink="/login" class="header__nav-link header__nav-link--mobile-only" (click)="closeMobileMenu()">Login</a>
            <a routerLink="/register" class="header__nav-link header__nav-link--mobile-only header__nav-link--register" (click)="closeMobileMenu()">Register</a>
          }
          @if (auth.isAuthenticated()) {
            <a routerLink="/orders" class="header__nav-link header__nav-link--mobile-only" (click)="closeMobileMenu()">My Orders</a>
            <a routerLink="/profile" class="header__nav-link header__nav-link--mobile-only" (click)="closeMobileMenu()">Profile</a>
            <button class="header__nav-link header__nav-link--mobile-only header__nav-logout" (click)="logout()">Logout</button>
          }
        </nav>

        <!-- Actions -->
        <div class="header__actions">
          <!-- Cart -->
          <a routerLink="/cart" class="header__action-btn" aria-label="Shopping cart">
            <span class="header__cart-icon">🛒</span>
            @if (cart.itemCount() > 0) {
              <span class="header__cart-badge">{{ cart.itemCount() }}</span>
            }
          </a>

          <!-- Auth: Desktop only -->
          @if (!auth.isAuthenticated()) {
            <a routerLink="/login" class="header__auth-link">Login</a>
            <a routerLink="/register" class="header__auth-link header__auth-link--register">Register</a>
          } @else {
            <!-- User Avatar Dropdown -->
            <div class="header__user" [class.header__user--open]="userMenuOpen()">
              <button
                class="header__user-btn"
                (click)="toggleUserMenu()"
                [attr.aria-expanded]="userMenuOpen()"
                aria-label="User menu"
              >
                <span class="header__user-avatar">
                  {{ auth.currentUser()?.name?.charAt(0)?.toUpperCase() ?? 'U' }}
                </span>
                <span class="header__user-name">{{ (auth.currentUser()?.name || 'User').split(' ')[0] }}</span>
                <span class="header__user-chevron">▾</span>
              </button>
              @if (userMenuOpen()) {
                <div class="header__user-dropdown" (click)="closeUserMenu()">
                  <a routerLink="/profile" class="header__dropdown-item">
                    <span>👤</span> My Profile
                  </a>
                  <a routerLink="/orders" class="header__dropdown-item">
                    <span>📦</span> My Orders
                  </a>
                  @if (auth.isAdmin()) {
                    <a routerLink="/admin" class="header__dropdown-item header__dropdown-item--admin">
                      <span>🛡</span> Admin Panel
                    </a>
                  }
                  <div class="header__dropdown-divider"></div>
                  <button class="header__dropdown-item header__dropdown-item--logout" (click)="logout()">
                    <span>🚪</span> Sign out
                  </button>
                </div>
              }
            </div>
          }

          <!-- Mobile hamburger -->
          <button
            class="header__hamburger"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="mobileMenuOpen()"
            aria-label="Toggle navigation menu"
          >
            <span class="header__hamburger-line" [class.header__hamburger-line--open1]="mobileMenuOpen()"></span>
            <span class="header__hamburger-line" [class.header__hamburger-line--open2]="mobileMenuOpen()"></span>
            <span class="header__hamburger-line" [class.header__hamburger-line--open3]="mobileMenuOpen()"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Backdrop for user dropdown -->
    @if (userMenuOpen()) {
      <div class="header__backdrop" (click)="closeUserMenu()"></div>
    }
    @if (mobileMenuOpen()) {
      <div class="header__backdrop" (click)="closeMobileMenu()"></div>
    }
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      z-index: var(--z-sticky);
      border-bottom: 1px solid transparent;
      transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
    }

    .header--scrolled {
      border-bottom-color: var(--color-border);
      box-shadow: var(--shadow-sm);
    }

    .header__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      gap: var(--space-8);
    }

    /* Logo */
    .header__logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      flex-shrink: 0;
    }

    .header__logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .header__logo-text {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-extrabold);
      letter-spacing: 0.15em;
      color: var(--color-text);
    }

    /* Nav */
    .header__nav {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      flex: 1;
    }

    .header__nav-link {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;

      &:hover {
        color: var(--color-text);
        background: var(--color-surface-alt);
      }
    }

    .header__nav-link--active {
      color: var(--color-accent) !important;
      background: var(--color-accent-lighter);
    }

    .header__nav-link--admin {
      color: var(--color-warning);
      &:hover { color: var(--color-warning); background: rgba(217,119,6,0.08); }
    }

    .header__nav-link--mobile-only {
      display: none;
    }

    .header__nav-link--register {
      background: var(--color-accent);
      color: var(--color-text-inverse) !important;
      &:hover { background: var(--color-accent-hover); }
    }

    .header__nav-logout {
      color: var(--color-error) !important;
      &:hover { background: var(--color-error-light); }
    }

    /* Actions */
    .header__actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-shrink: 0;
    }

    .header__action-btn {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);
      text-decoration: none;

      &:hover {
        background: var(--color-surface-alt);
      }
    }

    .header__cart-icon {
      font-size: var(--text-xl);
    }

    .header__cart-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-accent);
      color: var(--color-text-inverse);
      font-size: 10px;
      font-weight: var(--weight-bold);
      border-radius: var(--radius-full);
      padding: 0 4px;
    }

    .header__auth-link {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      text-decoration: none;

      &:hover {
        color: var(--color-text);
      }
    }

    .header__auth-link--register {
      background: var(--color-accent);
      color: var(--color-text-inverse);
      border-radius: var(--radius-md);

      &:hover {
        background: var(--color-accent-hover);
        color: var(--color-text-inverse);
      }
    }

    /* User dropdown */
    .header__user {
      position: relative;
    }

    .header__user-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      background: var(--color-surface);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: inherit;

      &:hover {
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(4,120,87,0.08);
      }
    }

    .header__user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
    }

    .header__user-name {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text);
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header__user-chevron {
      font-size: 10px;
      color: var(--color-text-tertiary);
      transition: transform var(--transition-fast);
    }

    .header__user--open .header__user-chevron {
      transform: rotate(180deg);
    }

    .header__user-dropdown {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      min-width: 180px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-dropdown);
      overflow: hidden;
      animation: fadeIn 150ms ease;
    }

    .header__dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast);
      width: 100%;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      text-align: left;

      &:hover {
        background: var(--color-surface-alt);
        color: var(--color-text);
      }
    }

    .header__dropdown-item--admin {
      color: var(--color-warning);
      &:hover { color: var(--color-warning); background: rgba(217,119,6,0.08); }
    }

    .header__dropdown-item--logout {
      color: var(--color-error);
      &:hover { background: var(--color-error-light); color: var(--color-error); }
    }

    .header__dropdown-divider {
      height: 1px;
      background: var(--color-border);
      margin: var(--space-1) 0;
    }

    /* Backdrop */
    .header__backdrop {
      position: fixed;
      inset: 0;
      z-index: calc(var(--z-sticky) - 1);
    }

    /* Hamburger */
    .header__hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      background: none;
      border: none;

      &:hover {
        background: var(--color-surface-alt);
      }
    }

    .header__hamburger-line {
      width: 20px;
      height: 2px;
      background: var(--color-text);
      border-radius: 1px;
      transition: all var(--transition-fast);
    }

    .header__hamburger-line--open1 { transform: translateY(7px) rotate(45deg); }
    .header__hamburger-line--open2 { opacity: 0; transform: scaleX(0); }
    .header__hamburger-line--open3 { transform: translateY(-7px) rotate(-45deg); }

    /* Mobile */
    @media (max-width: 767px) {
      .header__nav {
        display: none;
        position: fixed;
        top: var(--header-height);
        left: 0;
        right: 0;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        box-shadow: var(--shadow-md);
        flex-direction: column;
        padding: var(--space-4);
        gap: var(--space-1);
        z-index: var(--z-sticky);
        align-items: flex-start;
      }

      .header__nav--open {
        display: flex;
      }

      .header__nav-link {
        width: 100%;
        padding: var(--space-3) var(--space-4);
        text-align: left;
      }

      .header__nav-link--mobile-only {
        display: flex;
      }

      .header__hamburger {
        display: flex;
      }

      .header__auth-link {
        display: none;
      }

      .header__user-name {
        display: none;
      }
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  `],
  host: {
    '(window:scroll)': 'onScroll()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class HeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);

  protected isScrolled = signal(false);
  protected mobileMenuOpen = signal(false);
  protected userMenuOpen = signal(false);

  constructor() {
    // Initialize cart if authenticated
    if (this.auth.isAuthenticated()) {
      this.cart.fetchCart().subscribe();
    }
  }

  onScroll(): void {
    this.isScrolled.set(window.scrollY > 10);
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__user')) {
      this.userMenuOpen.set(false);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
    this.userMenuOpen.set(false);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((v) => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.cart.clearCartSignal();
    this.closeUserMenu();
    this.closeMobileMenu();
  }
}
