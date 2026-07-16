import { Component, ChangeDetectionStrategy, input, booleanAttribute } from '@angular/core';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge badge--{{ variant() }}" [class.badge--pill]="pill()">
      <ng-content />
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 2px var(--space-2);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      border-radius: var(--radius-xs);
      white-space: nowrap;
      line-height: 1.5;
    }

    .badge--pill {
      border-radius: var(--radius-full);
      padding: 2px var(--space-3);
    }

    .badge--success {
      background: var(--color-success-light);
      color: var(--color-success);
    }

    .badge--warning {
      background: var(--color-warning-light);
      color: #92400e;
    }

    .badge--danger {
      background: var(--color-error-light);
      color: var(--color-error);
    }

    .badge--info {
      background: var(--color-info-light);
      color: var(--color-info);
    }

    .badge--neutral {
      background: var(--color-surface-alt);
      color: var(--color-text-secondary);
    }

    .badge--accent {
      background: var(--color-accent-light);
      color: var(--color-accent);
    }
  `],
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
  readonly pill = input(false, { transform: booleanAttribute });
}
