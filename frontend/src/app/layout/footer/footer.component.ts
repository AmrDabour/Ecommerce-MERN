import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="footer__inner container">
        <div class="footer__grid">
          <!-- Brand -->
          <div class="footer__brand">
            <div class="footer__logo">
              <img src="https://img.icons8.com/fluency/96/diamond.png" alt="Luxe Logo" class="footer__logo-img">
              <span class="footer__logo-text">LUXE</span>
            </div>
            <p class="footer__tagline">
              Premium modern essentials for creators, teams, and everyday productivity. We believe in quality without compromise.
            </p>
            <div class="footer__socials">
              <a href="#" class="footer__social-link" title="Twitter">𝕏</a>
              <a href="#" class="footer__social-link" title="Instagram">📸</a>
              <a href="#" class="footer__social-link" title="LinkedIn">💼</a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer__col">
            <h4 class="footer__heading">Shop</h4>
            <nav class="footer__links">
              <a routerLink="/products" class="footer__link">All Products</a>
              <a routerLink="/products" class="footer__link">New Arrivals</a>
              <a routerLink="/products" class="footer__link">Best Sellers</a>
              <a routerLink="/products" class="footer__link">Sale Offers</a>
            </nav>
          </div>

          <!-- Account -->
          <div class="footer__col">
            <h4 class="footer__heading">Account</h4>
            <nav class="footer__links">
              <a routerLink="/profile" class="footer__link">My Profile</a>
              <a routerLink="/orders" class="footer__link">Order History</a>
              <a routerLink="/cart" class="footer__link">Shopping Cart</a>
              <a routerLink="/auth/login" class="footer__link">Sign In</a>
            </nav>
          </div>

          <!-- Newsletter -->
          <div class="footer__col footer__col--newsletter">
            <h4 class="footer__heading">Stay in the Loop</h4>
            <p class="footer__newsletter-desc">Subscribe to get special offers, free giveaways, and updates.</p>
            <form class="footer__form" (submit)="$event.preventDefault()">
              <input type="email" placeholder="Your email address" class="footer__input" required>
              <button type="submit" class="footer__submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copyright">
            © {{ currentYear }} LUXE Store. All rights reserved.
          </p>
          <div class="footer__legal">
            <a href="#" class="footer__legal-link">Privacy Policy</a>
            <a href="#" class="footer__legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0f172a; /* Slate 900 */
      color: #cbd5e1; /* Slate 300 */
      border-top: none;
      padding: var(--space-20) 0 var(--space-8);
      margin-top: 0;
    }

    .footer__grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: var(--space-12);
    }

    .footer__logo {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .footer__logo-img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }

    .footer__logo-text {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-extrabold);
      letter-spacing: 0.15em;
      color: #f8fafc; /* Slate 50 */
    }

    .footer__tagline {
      font-size: var(--text-sm);
      color: #94a3b8; /* Slate 400 */
      max-width: 320px;
      line-height: var(--leading-relaxed);
      margin-bottom: var(--space-6);
    }

    .footer__socials {
      display: flex;
      gap: var(--space-4);
    }

    .footer__social-link {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      color: #f8fafc;
      text-decoration: none;
      font-size: var(--text-sm);
      transition: all var(--transition-fast);
      &:hover {
        background: #10b981;
        transform: translateY(-2px);
      }
    }

    .footer__heading {
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      color: #f8fafc;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: var(--space-5);
    }

    .footer__links {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .footer__link {
      font-size: var(--text-sm);
      color: #94a3b8;
      text-decoration: none;
      transition: color var(--transition-fast);
      &:hover { color: #10b981; }
    }

    .footer__newsletter-desc {
      font-size: var(--text-sm);
      color: #94a3b8;
      line-height: var(--leading-relaxed);
      margin-bottom: var(--space-4);
    }

    .footer__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .footer__input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      color: #f8fafc;
      font-size: var(--text-sm);
      font-family: inherit;
      outline: none;
      transition: border-color var(--transition-fast);
      &:focus { border-color: #10b981; }
      &::placeholder { color: #64748b; }
    }

    .footer__submit {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: #10b981;
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      cursor: pointer;
      font-family: inherit;
      transition: background var(--transition-fast);
      &:hover { background: #059669; }
    }

    .footer__bottom {
      margin-top: var(--space-16);
      padding-top: var(--space-8);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .footer__copyright {
      font-size: var(--text-sm);
      color: #64748b;
    }

    .footer__legal {
      display: flex;
      gap: var(--space-6);
    }

    .footer__legal-link {
      font-size: var(--text-sm);
      color: #64748b;
      text-decoration: none;
      transition: color var(--transition-fast);
      &:hover { color: #f8fafc; }
    }

    @media (max-width: 1024px) {
      .footer__grid { grid-template-columns: 1fr 1fr; gap: var(--space-10); }
      .footer__brand, .footer__col--newsletter { grid-column: 1 / -1; }
    }

    @media (max-width: 640px) {
      .footer__grid { grid-template-columns: 1fr; }
      .footer__bottom { flex-direction: column; text-align: center; }
    }
  `],
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();
}
