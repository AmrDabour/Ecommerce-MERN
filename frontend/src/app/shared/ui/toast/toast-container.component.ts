import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" role="alert" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <span class="toast__icon">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @case ('warning') { ⚠ }
              @case ('info') { ℹ }
            }
          </span>
          <span class="toast__message">{{ toast.message }}</span>
          <button
            class="toast__close"
            (click)="$event.stopPropagation(); toastService.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: calc(var(--header-height) + var(--space-4));
      right: var(--space-4);
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: 420px;
      width: 100%;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      pointer-events: auto;
      cursor: pointer;
      animation: slideInToast 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text);
    }

    .toast--success {
      border-left: 4px solid var(--color-success);
      .toast__icon { color: var(--color-success); }
    }

    .toast--error {
      border-left: 4px solid var(--color-error);
      .toast__icon { color: var(--color-error); }
    }

    .toast--warning {
      border-left: 4px solid var(--color-warning);
      .toast__icon { color: var(--color-warning); }
    }

    .toast--info {
      border-left: 4px solid var(--color-info);
      .toast__icon { color: var(--color-info); }
    }

    .toast__icon {
      font-size: var(--text-lg);
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }

    .toast__message {
      flex: 1;
      line-height: var(--leading-normal);
    }

    .toast__close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-xs);
      color: var(--color-text-tertiary);
      transition: color var(--transition-fast), background var(--transition-fast);
      font-size: var(--text-xs);

      &:hover {
        color: var(--color-text);
        background: var(--color-surface-alt);
      }
    }

    @keyframes slideInToast {
      from {
        opacity: 0;
        transform: translateX(100%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `],
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
