import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quantity-stepper.component.html',
  styleUrl: './quantity-stepper.component.scss',
})
export class QuantityStepperComponent {
  readonly quantity = input(1);
  readonly min = input(1);
  readonly max = input(99);
  readonly size = input<'sm' | 'md'>('md');
  readonly quantityChange = output<number>();

  increment(): void {
    if (this.quantity() < this.max()) {
      this.quantityChange.emit(this.quantity() + 1);
    }
  }

  decrement(): void {
    if (this.quantity() > this.min()) {
      this.quantityChange.emit(this.quantity() - 1);
    }
  }
}
