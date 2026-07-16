import { Component, ChangeDetectionStrategy, input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="input-group" [class.input-group--error]="error()" [class.input-group--disabled]="isDisabled">
      @if (label()) {
        <label class="input-group__label" [attr.for]="inputId()">
          {{ label() }}
          @if (required()) {
            <span class="input-group__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <div class="input-group__wrapper">
        @if (prefixIcon()) {
          <span class="input-group__icon input-group__icon--prefix">{{ prefixIcon() }}</span>
        }
        <input
          class="input-group__input"
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [attr.autocomplete]="autocomplete()"
          [value]="value"
          [disabled]="isDisabled"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
        @if (suffixIcon()) {
          <span class="input-group__icon input-group__icon--suffix">{{ suffixIcon() }}</span>
        }
      </div>
      @if (error()) {
        <span class="input-group__error" role="alert">{{ error() }}</span>
      }
      @if (hint() && !error()) {
        <span class="input-group__hint">{{ hint() }}</span>
      }
    </div>
  `,
  styles: [`
    .input-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      width: 100%;
    }

    .input-group__label {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text);
    }

    .input-group__required {
      color: var(--color-error);
      margin-left: 2px;
    }

    .input-group__wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-group__input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: var(--text-base);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      outline: none;

      &::placeholder {
        color: var(--color-text-tertiary);
      }

      &:hover:not(:disabled) {
        border-color: var(--color-border-hover);
      }

      &:focus {
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.12);
      }

      &:disabled {
        background: var(--color-surface-alt);
        color: var(--color-text-tertiary);
        cursor: not-allowed;
      }
    }

    .input-group__icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-tertiary);
      font-size: var(--text-lg);
      pointer-events: none;
    }

    .input-group__icon--prefix {
      left: var(--space-3);
      & + .input-group__input,
      & ~ .input-group__input {
        padding-left: calc(var(--space-3) + 24px + var(--space-2));
      }
    }

    .input-group__icon--suffix {
      right: var(--space-3);
    }

    /* Error state */
    .input-group--error {
      .input-group__input {
        border-color: var(--color-error);

        &:focus {
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
        }
      }

      .input-group__label {
        color: var(--color-error);
      }
    }

    .input-group__error {
      font-size: var(--text-xs);
      color: var(--color-error);
      margin-top: var(--space-1);
    }

    .input-group__hint {
      font-size: var(--text-xs);
      color: var(--color-text-tertiary);
      margin-top: var(--space-1);
    }

    .input-group--disabled {
      opacity: 0.6;
    }
  `],
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly type = input('text');
  readonly placeholder = input('');
  readonly error = input('');
  readonly hint = input('');
  readonly inputId = input('');
  readonly required = input(false);
  readonly autocomplete = input('off');
  readonly prefixIcon = input('');
  readonly suffixIcon = input('');

  value = '';
  isDisabled = false;

  private onChangeFn: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChangeFn(this.value);
  }
}
