import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [],
  template: `
    <div 
      class="skeleton-block" 
      [style.width]="width" 
      [style.height]="height" 
      [style.border-radius]="borderRadius"
      [style.margin-bottom]="marginBottom">
    </div>
  `,
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() borderRadius: string = '4px';
  @Input() marginBottom: string = '0';
}
