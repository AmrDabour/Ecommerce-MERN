import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
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
