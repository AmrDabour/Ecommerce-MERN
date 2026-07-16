import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper" [class.stepper--sm]="size() === 'sm'">
      <button
        class="stepper__btn"
        [disabled]="quantity() <= min()"
        (click)="decrement()"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span class="stepper__value">{{ quantity() }}</span>
      <button
        class="stepper__btn"
        [disabled]="quantity() >= max()"
        (click)="increment()"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  `,
  styles: [`
    .stepper {
      display: inline-flex;
      align-items: center;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface);
    }

    .stepper__btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--color-text);
      background: var(--color-surface);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover:not(:disabled) {
        background: var(--color-surface-alt);
        color: var(--color-accent);
      }

      &:active:not(:disabled) {
        transform: scale(0.9);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .stepper__value {
      min-width: 48px;
      text-align: center;
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--color-text);
      border-left: 1.5px solid var(--color-border);
      border-right: 1.5px solid var(--color-border);
      padding: var(--space-2) var(--space-3);
      user-select: none;
    }

    .stepper--sm {
      .stepper__btn {
        width: 32px;
        height: 32px;
        font-size: var(--text-base);
      }

      .stepper__value {
        min-width: 36px;
        font-size: var(--text-sm);
        padding: var(--space-1) var(--space-2);
      }
    }
  `],
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
