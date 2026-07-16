import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found">
      <div class="not-found__content">
        <span class="not-found__code">404</span>
        <h1 class="not-found__title">Page Not Found</h1>
        <p class="not-found__message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a routerLink="/" class="not-found__btn">Back to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      padding-top: var(--header-height);
    }

    .not-found__content {
      text-align: center;
      max-width: 480px;
    }

    .not-found__code {
      font-size: 120px;
      font-weight: var(--weight-extrabold);
      font-family: var(--font-display);
      color: var(--color-accent-light);
      line-height: 1;
    }

    .not-found__title {
      font-size: var(--text-3xl);
      margin-top: var(--space-4);
    }

    .not-found__message {
      margin-top: var(--space-3);
      color: var(--color-text-tertiary);
    }

    .not-found__btn {
      display: inline-block;
      margin-top: var(--space-8);
      padding: var(--space-3) var(--space-8);
      background: var(--color-accent);
      color: var(--color-text-inverse);
      border-radius: var(--radius-md);
      font-weight: var(--weight-semibold);
      font-size: var(--text-sm);
      text-decoration: none;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-accent-hover);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }
  `],
})
export class NotFoundComponent {}
