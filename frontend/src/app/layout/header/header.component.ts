import { Component, OnInit, signal, inject, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CartDrawerService } from '../../shared/ui/cart-drawer/cart-drawer.service';
import { SearchBarComponent } from '../../shared/ui/search-bar/search-bar.component';
import { WishlistService } from '../../core/services/wishlist.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, throttleTime } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class HeaderComponent implements OnInit {
  private readonly router = inject(Router);
  protected  readonly auth = inject(AuthService);
  readonly cartService = inject(CartService);
  readonly cartDrawer = inject(CartDrawerService);
  readonly wishlistService = inject(WishlistService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly user = this.auth.currentUser;
  protected readonly cartCount = computed(() => {
    const cart = this.cartService.cart();
    return cart?.cartItems.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  });

  protected readonly isScrolled = signal(false);
  protected readonly isDarkMode = signal(false);
  protected mobileMenuOpen = signal(false);
  protected userMenuOpen = signal(false);

  ngOnInit(): void {
    // Check initial theme
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode.set(true);
      this.document.documentElement.classList.add('dark');
    }

    // Debounce scroll listener
    fromEvent(window, 'scroll')
      .pipe(
        throttleTime(50),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.isScrolled.set(window.scrollY > 20);
      });
  }

  protected toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      this.document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      this.document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  protected  openCart() {
    this.cartDrawer.open();
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
    this.cartService.clearCartSignal();
    this.closeUserMenu();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}
