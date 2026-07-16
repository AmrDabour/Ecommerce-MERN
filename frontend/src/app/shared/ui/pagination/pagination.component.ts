import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="pagination" aria-label="Pagination">
      <button
        class="pagination__btn"
        [disabled]="currentPage() <= 1"
        (click)="onPrevious()"
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <span class="pagination__info">
        Page {{ currentPage() }}
      </span>

      <button
        class="pagination__btn"
        [disabled]="!hasNextPage()"
        (click)="onNext()"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-6) 0;
    }

    .pagination__btn {
      padding: var(--space-2) var(--space-4);
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      transition: all var(--transition-fast);
      cursor: pointer;

      &:hover:not(:disabled) {
        border-color: var(--color-accent);
        color: var(--color-accent);
        background: var(--color-accent-lighter);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .pagination__info {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      font-weight: var(--weight-medium);
      min-width: 80px;
      text-align: center;
    }
  `],
})
export class PaginationComponent {
  readonly currentPage = input(1);
  readonly pageSize = input(10);
  readonly resultsOnPage = input(0);
  readonly pageChange = output<number>();

  /** No total count from backend, so we check if current page has fewer items than limit */
  readonly hasNextPage = computed(() => this.resultsOnPage() >= this.pageSize());

  onPrevious(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  onNext(): void {
    if (this.hasNextPage()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }
}
