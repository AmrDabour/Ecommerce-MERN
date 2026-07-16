import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type SkeletonVariant = 'rect' | 'circle' | 'text';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="skeleton skeleton--{{ variant() }}"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="variant() === 'circle' ? '50%' : ''"
      aria-hidden="true"
    ></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-surface-alt) 25%,
        #f0f0f0 50%,
        var(--color-surface-alt) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton--rect {
      border-radius: var(--radius-sm);
    }

    .skeleton--circle {
      border-radius: 50%;
    }

    .skeleton--text {
      border-radius: var(--radius-xs);
      height: 14px;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `],
})
export class SkeletonComponent {
  readonly variant = input<SkeletonVariant>('rect');
  readonly width = input('100%');
  readonly height = input('20px');
}
