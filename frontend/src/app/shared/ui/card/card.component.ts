import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" [class.card--hoverable]="hoverable()" [class.card--no-padding]="noPadding()">
      <ng-content />
    </div>
  `,
  styles: [`
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    }

    .card--hoverable {
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
    }

    .card--no-padding {
      padding: 0;
    }
  `],
})
export class CardComponent {
  readonly hoverable = input(false);
  readonly noPadding = input(false);
}
