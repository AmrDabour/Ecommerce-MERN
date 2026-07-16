import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type SkeletonVariant = 'rect' | 'circle' | 'text';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  readonly variant = input<SkeletonVariant>('rect');
  readonly width = input('100%');
  readonly height = input('20px');
}
