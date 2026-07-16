import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick()" role="dialog" aria-modal="true">
        <div
          class="modal"
          [class]="'modal modal--' + size()"
          (click)="$event.stopPropagation()"
        >
          <div class="modal__header">
            <h3 class="modal__title">{{ title() }}</h3>
            <button class="modal__close" (click)="close.emit()" aria-label="Close modal">✕</button>
          </div>
          <div class="modal__body">
            <ng-content />
          </div>
          <div class="modal__footer">
            <ng-content select="[modal-footer]" />
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal-backdrop);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      animation: fadeIn 200ms ease both;
    }

    .modal {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: scaleIn 250ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
      z-index: var(--z-modal);
    }

    .modal--sm { max-width: 400px; }
    .modal--md { max-width: 560px; }
    .modal--lg { max-width: 720px; }
    .modal--xl { max-width: 960px; }

    .modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--color-border);
    }

    .modal__title {
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      margin: 0;
    }

    .modal__close {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      color: var(--color-text-tertiary);
      font-size: var(--text-sm);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-surface-alt);
        color: var(--color-text);
      }
    }

    .modal__body {
      padding: var(--space-6);
      overflow-y: auto;
      flex: 1;
    }

    .modal__footer {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-3);

      &:empty {
        display: none;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `],
})
export class ModalComponent {
  readonly isOpen = input(false);
  readonly title = input('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly close = output<void>();

  onBackdropClick(): void {
    this.close.emit();
  }
}
